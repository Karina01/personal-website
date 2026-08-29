/**
 * Pulls the newsletter down from Substack and writes it into src/writing/.
 *
 * Substack stays the place the newsletter is written and published. This
 * script is the one-way door from there to here: it reads the public RSS
 * feed, strips the Substack furniture out of the post body, pulls the images
 * down so the site serves them itself, and writes one markdown file per post.
 *
 *   node tools/import-substack.mjs           # write anything new
 *   node tools/import-substack.mjs --force   # rewrite every post
 *   node tools/import-substack.mjs --dry-run # report, touch nothing
 */

import fs from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "htmlparser2";
import * as domutils from "domutils";
import render from "dom-serializer";

const FEED = "https://fortheloveofbmo.substack.com/feed";
const POSTS_DIR = "src/writing";
const IMAGES_DIR = "src/images/writing";

// Substack's CDN resizes on request. 1456 is the width its own web reader
// asks for, and the text column here is 680, so it covers 2x without asking
// for the 3000px originals.
const IMAGE_WIDTH = 1456;

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const DRY_RUN = args.has("--dry-run");

/* --- Feed ---------------------------------------------------------------- */

function textOf(node) {
  return node ? domutils.textContent(node).trim() : "";
}

// RSS delivers titles and decks as CDATA with HTML entities still in them
// ("Fælled" arrives as "F&#230;lled"). Re-parsing resolves them.
function decodeEntities(str) {
  if (!str || !str.includes("&")) return str;
  return domutils.textContent(parseDocument(str));
}

// Abbreviations whose full stop does not end a sentence. Short enough to be
// worth listing, since getting one wrong truncates a deck mid-thought.
const ABBREVIATION =
  /(?:^|\s)(?:[A-Za-zÆØÅæøå]|mr|mrs|ms|dr|prof|st|no|vs|kr|approx|etc|e\.g|i\.e)\.$/i;

/**
 * The feed's "description" is Substack's auto-excerpt, which runs to whatever
 * length it likes — sometimes several sentences. One sentence is enough for
 * the index card and lands near the 155 characters search engines show, so
 * the deck is cut at the first sentence that genuinely ends.
 *
 * Left whole when there is nothing safe to cut at: an excerpt Substack has
 * already truncated mid-thought has no complete sentence to take.
 */
function firstSentence(text) {
  if (!text) return text;

  const boundary = /[.!?]["'\u201d\u2019)]*(?=\s)/g;
  let match;
  while ((match = boundary.exec(text)) !== null) {
    const stop = match.index;
    // Part of a run of dots, so an ellipsis rather than a full stop.
    if (text[stop - 1] === "." || text[stop + 1] === ".") continue;

    const head = text.slice(0, stop + 1);
    if (ABBREVIATION.test(head)) continue;

    const rest = text.slice(match.index + match[0].length).trim();
    if (!rest) break; // already a single sentence
    // What follows has to look like the start of a new sentence.
    if (!/^["'\u201c\u2018(]?[A-Z0-9ÆØÅ]/.test(rest)) continue;

    const candidate = head.trim();
    // A stubby opener ("Wow.") makes a poor card on its own, so keep going
    // and let the next boundary carry it. Set low enough that a genuine
    // short question — "Are two BMOs in one day too many?" — still stands.
    if (candidate.length < 25) continue;

    return candidate;
  }
  return text;
}

function childNamed(parent, name) {
  return domutils.findOne(
    (el) => el.name === name,
    parent.children ?? [],
    false
  );
}

async function fetchFeed() {
  const res = await fetch(FEED, {
    headers: { "user-agent": "karinabrown.xyz importer" },
  });
  if (!res.ok) throw new Error(`Feed returned ${res.status}`);
  const doc = parseDocument(await res.text(), { xmlMode: true });
  return domutils
    .findAll((el) => el.name === "item", doc.children)
    .map((item) => {
      const enclosure = childNamed(item, "enclosure");
      return {
        title: decodeEntities(textOf(childNamed(item, "title"))),
        deck: firstSentence(decodeEntities(textOf(childNamed(item, "description")))),
        link: textOf(childNamed(item, "link")),
        date: new Date(textOf(childNamed(item, "pubDate"))),
        body: textOf(childNamed(item, "content:encoded")),
        hero: enclosure?.attribs?.url ?? null,
      };
    });
}

/* --- Slugs --------------------------------------------------------------- */

// The Substack URL already carries a slug. Reuse it, so a post keeps the same
// address here as there and the mapping stays obvious.
function slugFor(post) {
  const fromUrl = post.link.split("/p/")[1]?.split(/[?#]/)[0];
  if (fromUrl) return fromUrl;
  return post.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/* --- Images -------------------------------------------------------------- */

// A Substack image URL is a Cloudinary-style transform segment wrapped around
// the percent-encoded S3 original. Rewriting that segment asks the CDN for a
// smaller, modern rendition: the 2885px JPEG hero comes back as a 1456px WebP
// a third of the size. The signature in the original segment is not enforced.
function sizedUrl(url, width) {
  const CDN = "https://substackcdn.com/image/fetch/";
  const transforms = `w_${width},c_limit,f_webp,q_auto:good`;
  const marker = "/image/fetch/";
  const at = url.indexOf(marker);

  // Body images arrive already wrapped: swap the transform segment out.
  if (at !== -1) {
    const rest = url.slice(at + marker.length);
    const origin = rest.slice(rest.search(/https?(%3A|:)/i));
    return `${url.slice(0, at + marker.length)}${transforms}/${origin}`;
  }

  // Feed enclosures are sometimes the bare S3 original instead, at full
  // camera resolution. Wrap those so they come back resized as well.
  if (/^https?:\/\/substack-post-media\.s3\./.test(url)) {
    return `${CDN}${transforms}/${encodeURIComponent(url)}`;
  }
  return url;
}

// The original's pixel size is on the end of the S3 filename, so the intrinsic
// dimensions can be worked out without decoding the file. Emitting them keeps
// the page from reflowing as each photograph arrives.
function dimensionsFor(url, width) {
  const match = decodeURIComponent(url).match(/_(\d+)x(\d+)\.[a-z]+/i);
  if (!match) return null;
  const [w, h] = [Number(match[1]), Number(match[2])];
  if (!w || !h) return null;
  if (w <= width) return { width: w, height: h };
  return { width, height: Math.round((h / w) * width) };
}

async function downloadImage(url, destDir, name) {
  const file = `${name}.webp`;
  const dest = path.join(destDir, file);
  try {
    await fs.access(dest);
    return file; // already have it
  } catch {}
  const res = await fetch(sizedUrl(url, IMAGE_WIDTH), {
    headers: { "user-agent": "karinabrown.xyz importer" },
  });
  if (!res.ok) throw new Error(`Image ${url} returned ${res.status}`);
  await fs.mkdir(destDir, { recursive: true });
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return file;
}

/* --- Body cleanup -------------------------------------------------------- */

const DROP_CLASSES = [
  "subscription-widget-wrap-editor",
  "subscription-widget",
  "button-wrapper",
  "image-link-expand",
];

function hasClass(el, name) {
  return (el.attribs?.class ?? "").split(/\s+/).includes(name);
}

function isElement(node) {
  return node.type === "tag" || node.type === "script" || node.type === "style";
}

/**
 * Substack wraps every run of text in a <span>, nests images four divs deep,
 * and appends a subscribe form. None of that survives the trip. What is left
 * is the small vocabulary the post actually uses: p, h2, h3, em, strong, a,
 * figure, blockquote, hr, ul, ol, li.
 */
function cleanBody(html, { images, slug }) {
  const doc = parseDocument(html);

  // Images first: the figure has to be rebuilt before the spans around it go.
  const figures = domutils.findAll(
    (el) => el.name === "figure" || hasClass(el, "captioned-image-container"),
    doc.children
  );
  for (const fig of figures) {
    if (fig.name !== "figure") continue;
    const img = domutils.findOne((el) => el.name === "img", fig.children);
    if (!img) {
      domutils.removeElement(fig);
      continue;
    }
    const caption = domutils.findOne(
      (el) => el.name === "figcaption",
      fig.children
    );
    const captionText = caption ? textOf(caption) : "";
    const source = img.attribs.src ?? "";
    let record = images.find((i) => i.source === source);
    if (!record) {
      record = {
        source,
        local: `/images/writing/${slug}/${String(images.length + 1).padStart(2, "0")}`,
        dimensions: dimensionsFor(source, IMAGE_WIDTH),
      };
      images.push(record);
    }
    const size = record.dimensions
      ? ` width="${record.dimensions.width}" height="${record.dimensions.height}"`
      : "";

    // Substack posts carry no alt text. Where there is a caption it describes
    // the photograph, so it doubles as the alt; otherwise the image is left
    // explicitly undescribed rather than given an invented description.
    const rebuilt = parseDocument(
      `<figure class="post__figure">` +
        `<img src="${record.local}" alt="${escapeAttr(captionText)}"${size}` +
        ` loading="lazy" decoding="async" />` +
        (captionText
          ? `<figcaption class="caption">${escapeHtml(captionText)}</figcaption>`
          : "") +
        `</figure>`
    ).children[0];
    domutils.replaceElement(fig, rebuilt);
  }

  // Substack furniture.
  for (const el of domutils.findAll(
    (el) =>
      DROP_CLASSES.some((c) => hasClass(el, c)) ||
      ["button", "svg", "form", "input"].includes(el.name),
    doc.children
  )) {
    domutils.removeElement(el);
  }

  // Unwrap the span soup and the anchors Substack puts around every image.
  for (const el of domutils.findAll(
    (el) => el.name === "span" || hasClass(el, "image-link"),
    doc.children
  )) {
    unwrap(el);
  }

  // The page title is the h1, so a body h1 has to come down a level. Posts
  // covering two bakeries use h1 for each one and h2 for its subsections, so
  // everything shifts together rather than flattening onto a single level.
  const hasBodyH1 = domutils.existsOne((el) => el.name === "h1", doc.children);
  if (hasBodyH1) {
    for (const el of domutils.findAll((el) => el.name === "h3", doc.children)) {
      el.name = "h4";
    }
    for (const el of domutils.findAll((el) => el.name === "h2", doc.children)) {
      el.name = "h3";
    }
  }
  for (const el of domutils.findAll((el) => el.name === "h1", doc.children)) {
    el.name = "h2";
  }

  // Leftover empty wrappers and the blank paragraphs Substack leaves behind.
  let pruned = true;
  while (pruned) {
    pruned = false;
    for (const el of domutils.findAll(
      (el) => ["div", "p", "a"].includes(el.name),
      doc.children
    )) {
      const empty = textOf(el) === "" &&
        !domutils.findOne(
          (d) => ["img", "figure", "hr", "br"].includes(d.name),
          el.children
        );
      if (empty) {
        domutils.removeElement(el);
        pruned = true;
      } else if (el.name === "div") {
        unwrap(el);
        pruned = true;
      }
    }
  }

  for (const el of domutils.findAll((el) => el.name === "a", doc.children)) {
    delete el.attribs.class;
    delete el.attribs["data-component-name"];
    if (/^https?:/.test(el.attribs.href ?? "")) {
      el.attribs.rel = "noopener";
    }
  }
  for (const el of domutils.findAll(
    (el) => el.attribs && (el.attribs.class || el.attribs["data-attrs"]),
    doc.children
  )) {
    if (el.name === "figure" || el.name === "figcaption") continue;
    delete el.attribs.class;
    delete el.attribs["data-attrs"];
    delete el.attribs["data-component-name"];
  }

  return liftReferenceBox(doc);
}

function unwrap(el) {
  const children = [...(el.children ?? [])];
  for (const child of children) domutils.prepend(el, child);
  domutils.removeElement(el);
}

/**
 * Every review ends the same way: an "If you go" heading followed by a run of
 * label-and-value lines. That is a description list wearing a paragraph's
 * clothes, so it becomes one — which lets the layout set it as a reference
 * block rather than more running prose.
 *
 * The run has shown up in three shapes across the archive: paragraphs with a
 * leading <strong> label, the same paragraphs wrapped in a <blockquote>, and
 * paragraphs with the label as plain text before a colon. All three are read.
 */
function liftReferenceBox(doc) {
  const heading = domutils.findOne(
    (el) =>
      /^h[1-4]$/.test(el.name ?? "") &&
      /^if you go/i.test(textOf(el).replace(/[….]/g, "")),
    doc.children
  );
  if (!heading) return render(doc, { decodeEntities: false });

  // The lines are either the heading's own siblings, or wrapped in a single
  // container sitting where the first of them would be.
  const after = domutils.nextElementSibling(heading);
  const wrapper =
    after && ["blockquote", "div"].includes(after.name) ? after : null;
  let cursor = wrapper
    ? (wrapper.children ?? []).find((n) => isElement(n))
    : after;

  const rows = [];
  const consumed = [];
  while (cursor && cursor.name === "p") {
    const row = readRow(cursor);
    if (!row) break;
    rows.push(row);
    consumed.push(cursor);
    cursor = domutils.nextElementSibling(cursor);
  }
  if (!rows.length) return render(doc, { decodeEntities: false });

  const dl =
    `<dl class="factbox__list">` +
    rows
      .map(
        (r) =>
          `<dt class="factbox__term">${escapeHtml(r.label)}</dt>` +
          `<dd class="factbox__detail">${r.value}</dd>`
      )
      .join("") +
    `</dl>`;
  const block = parseDocument(
    `<aside class="factbox"><h2 class="factbox__heading">${escapeHtml(
      textOf(heading)
    )}</h2>${dl}</aside>`
  ).children[0];

  domutils.replaceElement(heading, block);
  if (wrapper) {
    domutils.removeElement(wrapper);
  } else {
    for (const el of consumed) domutils.removeElement(el);
  }
  return render(doc, { decodeEntities: false });
}

/** One "Label: value" line, however the label happens to be marked up. */
function readRow(p) {
  const strong = domutils.findOne((el) => el.name === "strong", p.children);
  if (strong && textOf(strong)) {
    const label = textOf(strong).replace(/\s*[:：]\s*$/, "");
    domutils.removeElement(strong);
    const value = render(p.children, { decodeEntities: false })
      .replace(/^\s*[:：]?\s*/, "")
      .trim();
    return value ? { label, value } : null;
  }

  // No markup on the label, so the colon is the only thing separating it from
  // the value. Bounded, so an ordinary sentence that happens to contain a
  // colon is not mistaken for one of these lines.
  const text = textOf(p);
  const colon = text.indexOf(":");
  if (colon < 1 || colon > 40) return null;
  const label = text.slice(0, colon).trim();
  if (/[.!?]$/.test(label)) return null;

  const html = render(p.children, { decodeEntities: false });
  const at = html.indexOf(":");
  if (at === -1) return null;
  const value = html.slice(at + 1).trim();
  return value ? { label, value } : null;
}

function escapeHtml(s) {
  return s.replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

/* --- Writing out --------------------------------------------------------- */

function frontmatter(fields) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "object") {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value)) {
        if (v === null || v === undefined || v === "") continue;
        lines.push(`  ${k}: ${quote(v)}`);
      }
    } else {
      lines.push(`${key}: ${quote(value)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

function quote(v) {
  const s = String(v);
  return /^[\w./-]+$/.test(s) ? s : `"${s.replace(/"/g, '\\"')}"`;
}

async function main() {
  const posts = await fetchFeed();
  console.log(`Feed: ${posts.length} post${posts.length === 1 ? "" : "s"}\n`);

  let written = 0;
  let skipped = 0;

  for (const post of posts) {
    const slug = slugFor(post);
    const file = path.join(POSTS_DIR, `${slug}.md`);
    const exists = await fs
      .access(file)
      .then(() => true)
      .catch(() => false);

    if (exists && !FORCE) {
      skipped++;
      continue;
    }

    const images = [];
    const body = cleanBody(post.body, { images, slug });

    // Resolve the placeholder paths now that every image is known.
    let resolved = body;
    const destDir = path.join(IMAGES_DIR, slug);
    for (const image of images) {
      if (DRY_RUN) continue;
      const file = await downloadImage(
        image.source,
        destDir,
        path.basename(image.local)
      );
      resolved = resolved.replaceAll(
        `"${image.local}"`,
        `"/images/writing/${slug}/${file}"`
      );
    }

    let hero = null;
    if (post.hero && !DRY_RUN) {
      const file = await downloadImage(post.hero, destDir, "hero");
      const size = dimensionsFor(post.hero, IMAGE_WIDTH);
      hero = {
        src: `/images/writing/${slug}/${file}`,
        width: size?.width,
        height: size?.height,
      };
    }

    const doc =
      frontmatter({
        title: post.title,
        date: post.date.toISOString(),
        deck: post.deck,
        substack: post.link,
        hero,
      }) +
      "\n\n" +
      resolved.trim() +
      "\n";

    console.log(
      `${DRY_RUN ? "would write" : exists ? "updated" : "new"}  ${slug}` +
        `  (${images.length} image${images.length === 1 ? "" : "s"})`
    );

    if (!DRY_RUN) {
      await fs.mkdir(POSTS_DIR, { recursive: true });
      await fs.writeFile(file, doc);
    }
    written++;
  }

  console.log(
    `\n${written} written, ${skipped} already present.` +
      (skipped && !FORCE ? " Use --force to rewrite." : "")
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
