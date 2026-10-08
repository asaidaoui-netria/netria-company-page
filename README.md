# Netria Company Page

Custom software and workflow automation, presented through a lightweight static homepage for Netria, plus articles built with [Eleventy](https://www.11ty.dev/).

## Positioning

Netria helps teams turn product ideas and operational friction into dependable software. The homepage presents two equal capability paths:

- build a custom digital product;
- improve an operation through automation and connected systems.

The authored content is English-only and uses semantic HTML so browser-native translation remains available.

## Design

The **Quiet Signal** identity combines:

- a near-black canvas;
- signal-green highlights;
- the Netria pixel moth;
- self-hosted Fusion Pixel bitmap typography with technical monospace labels;
- CRT scanlines, dithered textures, pixel-cut corners, and hard offset shadows;
- a no-scrollbar scene pager with a directional glyph-wave transition (careers.kimi.com parity), plus heading-decode and pixel-dissolve entrances on every scene entry;
- restrained grids, particles, and squared orbital geometry;
- live WebGPU scene layers via [shaders](https://github.com/shader-effects-inc/shaders), one green-phosphor reference per scene: an LED-matrix moth the cursor scatters (hero), a Tron grid floor the cursor ripples (capabilities), Severance-style refinement numbers under a cursor lens (principles), and an oscilloscope trace that spikes when you reach for the email link (contact). They load lazily and only with WebGPU, a fine pointer and motion allowed; otherwise the static page stays;
- hash deep-linking, wheel/touch/keyboard navigation, and reduced-motion instant cuts (no-JS keeps the normal scrolling document).

## Contact

Visitors contact Netria directly at [hello@netria.dev](mailto:hello@netria.dev). Every article ends with the same enquiry box, whose email subject names the article, so enquiries show which post brought them in.

## Writing Articles

Articles are Markdown files in `articles/`, published at `/articles/<slug>/`:

1. Copy `articles/2026-10-06-article-template.md` to `articles/YYYY-MM-DD-short-slug.md`. The date is the publish date; the rest of the name becomes the address.
2. Set `title` and `description` (the description is the summary shown in the listing, search results and link previews).
3. Write, preview with `npm start`, then remove `draft: true` and push to `main`.

Posts marked `draft: true` show in `npm start` but are never published. Optional front matter: `author:` with `name`, `role` and `url` adds a byline and names that person in the structured data (without it, articles are credited to Netria); `updated: YYYY-MM-DD` shows an Updated date and sets the modified date for search engines and the sitemap; `image:` and `imageAlt:` set a dedicated 1200x630 PNG share image (otherwise the site-wide one is used). Markdown can include plain HTML (keep it free of blank lines). The decision-models article's interactive model explorer is built from `articles/2026-10-08-decision-models.11tydata.json`, with logos in `assets/logos/`: edit that file, including its `asOf` date, as models change. The listing, feed (`/articles/feed.xml`), sitemap and search and share metadata update automatically.

## Project Structure

```text
.
├── .github/workflows/       # Build and deploy to GitHub Pages
├── _includes/               # Article page templates
├── articles/                # Markdown articles, listing and feed
├── assets/                  # Logos, favicons, fonts, and social artwork
├── docs/superpowers/        # Approved design and implementation plan (not published)
├── tests/                   # Node contract tests (not published)
├── CNAME                    # Custom-domain configuration
├── eleventy.config.js       # What gets built and published
├── index.html               # Semantic page content and metadata
├── robots.txt               # Points crawlers at the sitemap
├── llms.njk                 # Generates llms.txt, a site summary for AI answer engines
├── sitemap.njk              # Generates sitemap.xml
├── script.js                # Mobile navigation and progressive reveals
├── scenes.js                # Scene pager, glyph wave, entrances
├── signal.js                # Live WebGPU scene layers (progressive)
└── styles.css               # Quiet Signal visual system
```

## Local Development

From the project root:

```bash
npm install
npm start
```

Open `http://localhost:8080`. Pages reload as you edit, and drafts are visible. `npm run build` writes the published site to `_site/`.

## Validation

Run all contract tests (`npm test` runs the same command; the articles tests run a real build):

```bash
node --test tests/*.test.mjs
```

Check JavaScript syntax and whitespace:

```bash
node --check script.js
node --check scenes.js
node --check signal.js
git diff --check
```

The pages should also be checked at 320px, 768px, 1024px, and 1440px widths, with keyboard navigation and reduced motion enabled.

## To do

- Add an author profile page for Abderrahman SaidAlaoui and link article bylines to it (`author.url` in an article's front matter).

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: it installs dependencies, runs the tests, builds with Eleventy, and publishes `_site/` to GitHub Pages. Only the homepage files listed in `eleventy.config.js` and the rendered articles are published; a failing test stops the deploy. Built pages load `styles.css` and the scripts with a content hash (`?v=…`), so a deploy never pairs new HTML with a stylesheet a browser cached from the previous one. The repository's Pages source must be set to **GitHub Actions**, and the custom domain `www.netria.dev` is configured in the Pages settings.
