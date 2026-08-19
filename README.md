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
src/pages/       the five pages
src/projects/    Current Projects subpages (auto-listed on /current-projects/)
src/writing/     stubbed for newsletter posts — nothing links here yet
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

The handoff specified `#8B9C85` at rest darkening to `#75866F`. Both are
outside the brief's closed palette, and `#8B9C85` measures 2.62:1 against
`--ground` — below the 3:1 floor for non-text. The mark therefore uses
`--accent` at rest (4.31:1) and `--accent-deep` on hover (6.50:1), keeping
the handoff's structure. To use the original sages instead, set `color` on
`.nav__home` and its hover state in `main.css`.

### Adding the About photograph

Fill in the `photo` block in `src/pages/about.md` front matter (uncomment the
keys). Until `photo.src` is set, no `<img>` is emitted. Set `width` and
`height` to the intrinsic pixel size of the largest file so the browser can
reserve the space.

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
