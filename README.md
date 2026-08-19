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

## Deployment

Pushes to `main` build and deploy via `.github/workflows/deploy.yml`.
GitHub Pages must be set to "GitHub Actions" as its source. `src/CNAME`
carries the custom domain; `src/.nojekyll` stops Pages re-processing the
built output.
