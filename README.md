# karinabrown.xyz

Eleventy (11ty) static site, deployed to GitHub Pages at karinabrown.xyz.
No JavaScript framework, no analytics, no cookies, no third-party scripts.

## Running it

```
npm install
npm start     # dev server with live reload
npm run build # writes _site/
```

## Where things live

```
src/pages/       the five main pages, plus the BMO newsletter archive
src/projects/    Current Projects subpages (auto-listed on /current-projects/)
src/writing/     newsletter posts, imported from Substack (see below)
                 published under /current-projects/fortheloveofBMO/
tools/           the Substack importer
src/_includes/   base, page and post layouts, nav and footer partials
src/css/main.css every design token, defined once at the top
src/fonts/       self-hosted woff2, Latin subset
src/images/
```

Copy lives in markdown with front matter, so it can be edited without
touching templates.

### Adding Experience copy

`src/pages/experience.md` uses a `chapter` shortcode. First argument is the
date range shown in the margin column, second is the chapter heading; the
body between the tags is ordinary markdown.

```
{% chapter "2021 — 2026", "Chapter heading" %}
Prose, in markdown.
{% endchapter %}
```

### Adding a project

Drop a markdown file in `src/projects/` with `title` and `order` in the front
matter. It gets its own page and appears on `/current-projects/`, which
renders each project's own body — so the text lives in one file only and the
index cannot drift out of step with the subpage.

### The newsletter

Substack stays the place the newsletter is written and published. The site
keeps a reading copy, imported one way:

```
npm run import              # write anything new
npm run import -- --force   # rewrite every post
npm run import -- --dry-run # report, touch nothing
```

The newsletter is deliberately not in the top nav. It is reached from the
"For the love of BMO" blurb in `src/projects/for-the-love-of-bmo.md`, whose
"here" link points at the archive; that one file feeds both `/current-projects/`
and the project's own page, so the link cannot drift out of step.

`tools/import-substack.mjs` reads the public RSS feed, which carries the full
post body in `content:encoded`. For each post it:

- reuses the Substack slug, so a post has the same address in both places;
- cuts the deck at the first sentence. The feed's "description" is Substack's
  auto-excerpt and runs to whatever length it likes; one sentence suits the
  index card and lands near the 155 characters search engines show. It is left
  whole when there is nothing safe to cut at — an excerpt already truncated
  mid-thought, or a full stop that belongs to an abbreviation;
- strips the Substack furniture — the span soup around every run of text, the
  nested image wrappers, the expand buttons and the subscribe form — leaving
  the small vocabulary the posts actually use: `p`, `h2`, `h3`, `em`,
  `strong`, `a`, `figure`, `blockquote`, `hr`;
- demotes any body `h1` to `h2`, since the page title is the `h1`;
- turns the closing "If you go" run of `<strong>Label:</strong> value`
  paragraphs into a description list, which the layout sets as a reference
  block (`.factbox`);
- pulls every image into `src/images/writing/<slug>/`, asking the Substack CDN
  for a 1456px WebP rather than the multi-megabyte camera original, and writes
  intrinsic `width`/`height` so the page does not reflow as they arrive.

Posts already on disk are left alone unless `--force` is passed, so editing an
imported file by hand is safe.

Two things are worth knowing:

- **Alt text.** Substack posts carry none. Where an image has a caption the
  caption is used; otherwise `alt=""` is written, which marks the photograph
  decorative. Real alt text has to be added by hand.
- **Canonical.** Posts point `rel=canonical` at Substack, so the original
  keeps the search authority and the copy here does not compete with it. That
  is one line in `src/_includes/layouts/base.njk` if the trade is ever worth
  reversing.

### The home mark

`src/images/logo.svg` is the KB mark from the Claude Design project
`fcd054ce-d150-4e93-99b0-1d17634e1f38` (variant 3a, the traced sketch —
a single closed contour, no counters). The path data is byte-identical to
that project's `kb-logo.svg`.

The nav inlines it at build time, so its fill follows `color` and darkens on
hover and focus rather than fading — which is what the handoff note asked
for. It renders 36px tall; the 100 x 139 aspect means only the height is
set, so it cannot distort. The link carries the accessible name and the SVG
is `aria-hidden`, so it is announced once.

From 1244px up the mark is fixed in the corner and stays put while the page
scrolls; the nav links still scroll away, so the brief's "nav is not sticky"
holds for everything except the mark. 1244px is where the container first has
side margin to spare — below it, content sits at the gutter and a fixed mark
would land on the text. The derivation is in a comment above the media query.

The handoff specified `#8B9C85` at rest darkening to `#75866F`. Both are
outside the brief's closed palette, and `#8B9C85` measures 2.62:1 against
`--ground` — below the 3:1 floor for non-text. The mark therefore uses
`--accent` at rest (4.31:1) and `--accent-deep` on hover (6.50:1), keeping
the handoff's structure. To use the original sages instead, set `color` on
`.nav__home` and its hover state in `main.css`.

### Adding the About photograph

Put the files in `src/images/`, then fill in the `photo` block in
`src/pages/about.md` front matter (uncomment the keys). Until `photo.src` is
set, no `<img>` is emitted, so a half-finished state cannot ship.

The figure renders 528px wide on desktop, breaking 188px left into the
margin column with body copy alongside. Below 900px it goes full width — up
to 680px — with the copy beneath. So the largest it is ever displayed is
680px, and the widest file worth shipping is 1360px for 2x screens.

Export widths 528, 680, 1056 and 1360 and list them in `srcset`; `sizes` is
already set to match the layout. Set `width` and `height` to the intrinsic
pixel size of the largest file so the browser reserves the space and the
page does not jump.

The photo sits above the fold at every size, so it is deliberately not
lazy-loaded — it is the page's largest paint. Keep the largest file under
about 150KB.

`photo.alt` is required and should describe the photograph, not repeat the
page title. `photo.caption` is optional and renders underneath at 15px.

## Two deviations from the brief, both forced by the contrast floor

The brief sets a 4.5:1 minimum for text. Two of its own token assignments
fall below that, so the role moved to the nearest token that passes. The
palette itself is unchanged — no new colours were introduced.

| Brief says | Measured | Used instead | Measured |
|---|---|---|---|
| `--ink-mute` for metadata and date ranges | 3.46:1 | `--ink-soft` | 5.01:1 |
| `--accent` for link text | 4.31:1 | `--accent-deep` | 6.50:1 |

`--accent` is still doing its job everywhere it passes: link underlines at
rest (which transition to `--accent-deep` on hover), the focus ring, the
nav underline, small marks. `--ink-mute` is currently unused.

Everything else measured clean: `--ink` on all four card tints is 5.6–8.7:1,
`--ground` on `--accent-deep` (the flip-card reverse) is 6.5:1.

## Flip cards: layout vs capability

Two separate questions, deliberately keyed to different things.

**Layout** is a question of width — four across, two across below 900px.

**Whether the card flips** is a question of input capability, not width:
`@media (hover: none)` gets the static face, at any width. A narrow desktop
window can still hover, so it keeps the flip; a phone cannot, so it does not.
That matches the brief's reasoning ("hover does not exist" on phones) rather
than its width-based wording.

When overriding the flip, reset the transform through the same `:hover` and
`:focus-visible` selectors that set it. A bare `.card__inner` loses to them
on specificity, which leaves the card mid-rotation with its back face
`display: none` — it vanishes on hover instead of staying put.

## Page titles

Titles take `--size-oneliner` — the same token as the home one-liner, so the
two cannot drift apart — and start at the left edge of the grid, flush with
the margin column. On Experience that puts the title in line with the date
ranges below it.

`.page-head__inner` mirrors `.row`'s width at both breakpoints: the grid
block (`--margin-col` + 48 + `--measure`) above 900px, and `--measure` below,
where `.row` collapses to a single column. Verified flush with the date
ranges at 1600, 1440, 1280, 1024, 950, 899, 800, 640 and 375 — the widths
either side of the breakpoint are the ones that catch a mismatch.

## The home page invert

Clicking the KB mark on the home page inverts it: dark ground, light text.
Deliberately undiscoverable — an easter egg, not a feature. Revisit after
launch, when the options are a real `prefers-color-scheme` default plus a
small override in the footer.

Three things make it work:

- On `/` the mark renders as a `<button>` with `aria-label="Dark theme"` and
  `aria-pressed`, not as a link. A link that does not navigate lies to
  assistive tech. On every other page it is still a link home.
- `<html>` carries `data-theme="light"` on the home page only, so the colour
  transition has something to move from on the very first click.
- Nothing is persisted. Navigating away returns to the light design, which
  is the one the site is designed in. Persisting would mean a dark palette
  for all nine pages plus an inline head script to stop the wrong theme
  flashing on load.

`--card-back` and `--card-back-ink` are pinned rather than derived from
`--accent-deep`, so the flip-card reverse looks the same in both directions.

Every dark value was measured against the dark ground: text 12.11:1,
`--ink-soft` 5.90:1, `--accent` 6.40:1 (the light sage from the logo
handoff), `--accent-cool` 6.58:1 — which is `--card-2` raw, the tint that
could not carry text on the light ground.

## One addition to the palette

`--accent-cool: #768C92` is the only colour on the site that is not in the
brief. It is `--card-2` darkened along its own hue until it can carry text:
the tint itself measures 1.84:1 against `--ground`, this measures 3.17:1.

That clears the 3:1 floor for text at this size and no more, so it is sound
where it is used and nowhere else. The one-liner sets at 76px on desktop and
32px on mobile; both are well above the 24px large-text threshold. Do not
reuse this token at body size, where the floor is 4.5:1.

It exists because the home one-liner's two full stops are the only colour
above the fold, and the palette's four passing colours are all sage or
grey-green — two of them side by side read as tonal, not as two colours.
Every card tint fails as text (1.4-2.2:1), so none could be used raw.

Scope is deliberately one glyph: the second full stop. If it spreads to
other elements, that is a palette decision worth making on purpose.

## Deployment

Pushes to `main` build and deploy via `.github/workflows/deploy.yml`.
GitHub Pages must be set to "GitHub Actions" as its source. `src/CNAME`
carries the custom domain; `src/.nojekyll` stops Pages re-processing the
built output.
