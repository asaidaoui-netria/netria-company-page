---
name: netria-articles
description: Use when researching, drafting, editing, publishing or promoting an article on netria.dev (files in articles/). Covers house style, interactive figures, the share image, search indexing and the X thread. File naming and front matter are in README.md, "Writing Articles".
---

# Netria articles

Lessons from shipping /articles/decision-models/. README.md ("Writing Articles") has the mechanics: file naming, front matter, drafts, author, share image fields. This covers what it doesn't.

## Voice

- Simple, direct, concise. Short sentences, one idea per paragraph.
- Prose, not bullet points. Turn lists into paragraphs.
- About the technology, not a pitch. No workflow-automation or "Netria can help" angle in the body; the layout's closing aside is the only ask.
- Explain the idea a topic borrows (decision models → Kahneman's System 1 and System 2) rather than assume readers know it.
- Vendor numbers are claims: say who reported them, say when sources conflict, label illustrative figures as illustrative.
- Link primary sources inline (announcements, docs). For books, link a bibliographic record such as `https://lccn.loc.gov/<lccn>`, never a shop.
- Fast-moving topics: give an as-of date and a "Keeping up" pointer to a live source, saying what it measures (OpenRouter rankings measure use, not quality).

## Research and data

- Cover the whole category, not just the well-known names. Check each item against its maker's own announcement and keep the https source with the data.
- Keep structured data out of prose: `articles/<file>.11tydata.json` with an `asOf` date, rendered by a shortcode (see `_includes/model-explorer.js`).

## Interactive pieces

- Shortcodes need `templateEngineOverride: njk,md` in front matter; Markdown otherwise runs without a template engine.
- Raw HTML in Markdown must have no blank lines or markdown-it splits it. Shortcodes join their output with `"\n"` and emit none.
- No-JS first: everything readable without scripts, JS only enhances (explorer.js is a WAI-ARIA tablist with arrow, Home and End keys).
- Animate only under `@media (prefers-reduced-motion: no-preference)`.
- Put data-may-be-stale disclaimers above the interactive box.
- Prefer compact: an icon dock with names on hover/focus beat labelled tabs; a plain spec row beat a timeline.
- `readingTime` strips `<div class="mx"…<!--/mx-->` before counting. Wrap any similar widget the same way or reading time inflates.

## Share image

- Source is `assets/og-<slug>.svg` (Fusion Pixel via `fonts/fusion-pixel-12px-monospaced-latin.otf.woff2`, site colours), exported to the 1200x630 PNG named in `image:`. Tests require a tracked 1200x630 PNG.
- X lays the link title over the card's bottom-left. On a ~300px phone card that label spans almost the full width, so keep everything that matters above y≈480 of the 1200x630 canvas. Byline goes in the header. Skip the domain; X prints "From netria.dev" under the card.
- Export with Playwright against the dev server, waiting for the font, not the load event (an SVG page may never fire it):

  ```js
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(`http://localhost:8000/assets/og-<slug>.svg?v=${Date.now()}`, { waitUntil: "commit" });
  await page.waitForFunction(() => document.fonts.check('24px "Fusion Pixel"'));
  await page.screenshot({ path: "assets/og-<slug>.png" });
  ```

- Before shipping, view it under a mock of X's label (13px text, 12px from the bottom-left) at 300px and 420px card widths. X caches a URL's card for about a week with no manual refresh, so get it right before the first post.

## Publish

- `npm test` runs a production build and checks it. Paths are compared against `git ls-files`: macOS hides case mismatches that 404 on GitHub Pages.
- Pushing to `main` deploys (Actions: test, build, Pages). Poll `curl -s 'https://api.github.com/repos/asaidaoui-netria/netria-company-page/actions/runs?per_page=1'` until the latest run is completed (public repo, so no `gh` login needed), then curl the live article, its image, `/sitemap.xml`, `/llms.txt` and `/articles/feed.xml`.
- Then request indexing. Google Search Console: paste the URL in the inspection bar, then Request indexing (deep links to inspection 404). Bing Webmaster Tools: the owner signs in and submits; never enter credentials for them.

## Promote on X

- A thread of 3 to 4 posts, each within 280 characters (a URL counts 23, an emoji 2). Link only in post 1, on its last line: X hides a trailing URL and shows the card. End post 1's text with 🧵.
- Each post replies to the previous one, not to post 1.
- Don't drive X's composer with browser automation. Keystrokes that miss the text box fire shortcuts (g then u, l like, t repost, b bookmark, u mute, x block), and adding posts can wipe the draft. Give the owner one post at a time with `pbcopy`. Never post without their explicit go-ahead.

## Dev server

- `npx eleventy --serve --port 8000` (adb often holds 8765). Restart it after editing `eleventy.config.js` or data files. `domDiff: false` is set because DOM patching left widgets showing their no-JS state.
