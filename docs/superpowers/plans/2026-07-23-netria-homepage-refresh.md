# Netria Homepage Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Morocco-focused, multilingual landing page with an English-only Quiet Signal homepage for custom software and workflow automation, using direct email contact and no analytics.

**Architecture:** Keep the existing static deployment model: semantic content in `index.html`, the complete visual system in `styles.css`, and progressive navigation/reveal behavior in `script.js`. Add dependency-free Node contract tests that read the shipped files directly, and retain the current GitHub Pages/custom-domain setup.

**Tech Stack:** HTML5, CSS custom properties and media queries, vanilla JavaScript, Node's built-in `node:test`, SVG source artwork, macOS `sips`, GitHub Pages.

## Global Constraints

- The authored site is English-only and compatible with browser-native translation.
- Custom software products and workflow automation receive equal prominence.
- The primary conversion is a direct email to `hello@netria.dev`.
- There is no form, Formspree integration, custom localization system, analytics script, or visitor tracking.
- Do not add a framework, package manager dependency, CMS, backend, database, or animation library.
- Do not add client logos, testimonials, delivery metrics, or unsupported claims.
- Use the approved Quiet Signal system: near-black background around `#050706`, off-white text, vivid signal green around `#63FF72`, restrained pixel geometry, and conventional scrolling.
- Motion is decorative, progressive, and disabled by `prefers-reduced-motion`.
- Content and navigation remain usable when JavaScript or remote fonts fail.
- Preserve the canonical URL `https://netria.dev/`.

## File Structure

- Modify `index.html`: metadata, navigation, all homepage sections, email actions, and semantic structure.
- Replace `styles.css`: Quiet Signal tokens, responsive layout, component styling, focus states, and reduced-motion behavior.
- Replace `script.js`: accessible mobile navigation and progressive section reveals only.
- Delete `i18n.js`: custom translations and language-drawer logic are out of scope.
- Modify `README.md`: current positioning, local-development instructions, structure, and validation.
- Create `assets/og-image.svg`: maintainable source for the social preview.
- Replace `assets/og-image.png`: generated 1200×630 social preview referenced by metadata.
- Create `tests/homepage-content.test.mjs`: content, privacy, localization, SEO, and semantic-contract checks.
- Create `tests/homepage-style.test.mjs`: approved tokens, responsive rules, focus, and reduced-motion checks.
- Create `tests/homepage-behavior.test.mjs`: minimal-JavaScript and navigation-accessibility checks.
- Create `tests/homepage-assets.test.mjs`: social-preview source and dimensions.
- Create `tests/readme.test.mjs`: documentation contract.

---

### Task 1: Replace the Page Content and Remove Retired Integrations

**Files:**
- Create: `tests/homepage-content.test.mjs`
- Modify: `index.html:1-326`
- Delete: `i18n.js`

**Interfaces:**
- Consumes: existing logo and favicon files in `assets/`.
- Produces: stable section IDs `capabilities`, `situations`, `approach`, `principles`, and `contact`; DOM hooks `navToggle`, `navMenu`, and `data-reveal`; a single `script.js` reference for Tasks 2 and 3.

- [ ] **Step 1: Write the failing content contract**

Create `tests/homepage-content.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");

test("uses internationally neutral English metadata", () => {
  assert.match(html, /<html lang="en" class="no-js">/);
  assert.match(html, /<title>Netria — Custom Software &amp; Workflow Automation<\/title>/);
  assert.match(
    html,
    /Netria designs and builds custom digital products and automated systems that turn complex work into forward motion\./
  );
  assert.match(html, /<link rel="canonical" href="https:\/\/netria\.dev\/">/);
  assert.doesNotMatch(
    html,
    /Morocco|Moroccan|Maroc|المغرب|Kenitra|Kénitra/i
  );
});

test("contains the approved dual-track content structure", () => {
  for (const id of ["capabilities", "situations", "approach", "principles", "contact"]) {
    assert.match(html, new RegExp(`<section[^>]+id="${id}"`));
  }

  assert.match(html, /Software for ideas and operations in motion\./);
  assert.match(html, /Build a product/);
  assert.match(html, /Improve a system/);
  assert.match(html, /Frame the problem/);
  assert.match(html, /Prototype the path/);
  assert.match(html, /Build and validate/);
  assert.match(html, /Release and evolve/);
});

test("uses direct email contact with no contact form", () => {
  assert.ok(
    (html.match(/mailto:hello@netria\.dev/g) ?? []).length >= 2,
    "expected at least two direct email actions"
  );
  assert.ok(
    (html.match(/hello@netria\.dev/g) ?? []).length >= 3,
    "expected a visible, copyable email fallback"
  );
  assert.doesNotMatch(html, /<form\b|Formspree|formspree\.io|contactForm/i);
});

test("ships no analytics or custom localization", () => {
  assert.doesNotMatch(html, /plausible|analytics|data-domain|langDrawer|language-selector/i);
  assert.doesNotMatch(html, /i18n\.js|data-i18n|hreflang/i);
  assert.equal(existsSync(join(root, "i18n.js")), false);
});

test("avoids unsupported proof claims", () => {
  assert.doesNotMatch(
    html,
    /trusted by|client logos?|testimonials?|100%|projects delivered|years of experience/i
  );
});

test("provides one navigation landmark and accessible menu hooks", () => {
  assert.equal((html.match(/<nav\b/g) ?? []).length, 1);
  assert.match(html, /id="navToggle"/);
  assert.match(html, /aria-controls="navMenu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /id="navMenu"/);
});
```

- [ ] **Step 2: Run the content contract and verify it fails**

Run:

```bash
node --test tests/homepage-content.test.mjs
```

Expected: failures for the old title and copy, Morocco-specific content, contact form, Plausible, localization, duplicated navigation, and existing `i18n.js`.

- [ ] **Step 3: Replace `index.html` with the approved semantic page**

Use this complete document:

```html
<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description"
        content="Netria designs and builds custom digital products and automated systems that turn complex work into forward motion.">
    <meta name="keywords"
        content="custom software development, workflow automation, web applications, mobile applications, system integrations, internal tools">
    <meta name="author" content="Netria">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#050706">

    <link rel="canonical" href="https://netria.dev/">
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://netria.dev/">
    <meta property="og:title" content="Netria — Custom Software &amp; Workflow Automation">
    <meta property="og:description"
        content="Netria designs and builds custom digital products and automated systems that turn complex work into forward motion.">
    <meta property="og:image" content="https://netria.dev/assets/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Netria pixel moth on a dark signal grid">
    <meta property="og:site_name" content="Netria">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Netria — Custom Software &amp; Workflow Automation">
    <meta name="twitter:description"
        content="Netria designs and builds custom digital products and automated systems that turn complex work into forward motion.">
    <meta name="twitter:image" content="https://netria.dev/assets/og-image.png">

    <title>Netria — Custom Software &amp; Workflow Automation</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;family=Space+Grotesk:wght@400;500;600;700&amp;display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header">
        <nav class="navbar" aria-label="Primary navigation">
            <a class="brand" href="#top" aria-label="Netria home">
                <picture>
                    <source srcset="assets/netria-logo-navbar-transparent.webp" type="image/webp">
                    <img src="assets/netria-logo-navbar-transparent.png" alt="" width="80" height="80">
                </picture>
                <span>Netria</span>
            </a>

            <button class="nav-toggle" id="navToggle" type="button"
                aria-controls="navMenu" aria-expanded="false" aria-label="Open navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div class="nav-menu" id="navMenu">
                <a href="#capabilities">Capabilities</a>
                <a href="#approach">Approach</a>
                <a href="#principles">Principles</a>
                <a class="nav-email" href="mailto:hello@netria.dev?subject=Project%20conversation">
                    Email Netria
                </a>
            </div>
        </nav>
    </header>

    <main id="main">
        <section class="hero" id="top">
            <div class="hero-copy" data-reveal>
                <p class="eyebrow"><span>01</span> Custom software · Workflow automation</p>
                <h1>Software for ideas and operations <em>in motion.</em></h1>
                <p class="hero-summary">
                    We design and build dependable digital products and automated systems
                    that turn complex work into forward motion.
                </p>
                <div class="hero-actions">
                    <a class="button button-primary"
                        href="mailto:hello@netria.dev?subject=Project%20conversation">
                        Start a conversation <span aria-hidden="true">↗</span>
                    </a>
                    <a class="button button-secondary" href="#capabilities">
                        Explore capabilities <span aria-hidden="true">↓</span>
                    </a>
                </div>
            </div>

            <div class="hero-signal" aria-hidden="true" data-reveal>
                <div class="signal-grid"></div>
                <div class="signal-orbit signal-orbit-large"></div>
                <div class="signal-orbit signal-orbit-small"></div>
                <div class="signal-core">
                    <picture>
                        <source srcset="assets/netria-logo-navbar-transparent.webp" type="image/webp">
                        <img src="assets/netria-logo-navbar-transparent.png" alt="" width="80" height="80">
                    </picture>
                </div>
                <span class="signal-pixel signal-pixel-one"></span>
                <span class="signal-pixel signal-pixel-two"></span>
                <span class="signal-pixel signal-pixel-three"></span>
            </div>

            <div class="hero-status" aria-hidden="true">
                <span>Signal active</span>
                <span>Custom systems · Built to evolve</span>
            </div>
        </section>

        <section class="section capabilities" id="capabilities">
            <div class="section-heading" data-reveal>
                <p class="eyebrow"><span>02</span> Two ways we help</p>
                <h2>Build something new.<br>Improve what already moves.</h2>
                <p>
                    One engineering partner for product ideas and friction-heavy operations.
                </p>
            </div>

            <div class="capability-grid">
                <article class="capability-card" data-reveal>
                    <div class="card-index">A / Product</div>
                    <h3>Build a product</h3>
                    <p>
                        Turn an idea into dependable software with a clear path from framing
                        and prototyping to implementation and release.
                    </p>
                    <ul>
                        <li>Web applications</li>
                        <li>Mobile experiences</li>
                        <li>Digital platforms</li>
                        <li>Internal tools</li>
                    </ul>
                </article>

                <article class="capability-card" data-reveal>
                    <div class="card-index">B / Systems</div>
                    <h3>Improve a system</h3>
                    <p>
                        Replace repetitive work and disconnected tools with automated,
                        understandable systems shaped around the people using them.
                    </p>
                    <ul>
                        <li>Workflow automation</li>
                        <li>System integrations</li>
                        <li>Operational tooling</li>
                        <li>Data flows and dashboards</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="section situations" id="situations">
            <div class="section-heading compact" data-reveal>
                <p class="eyebrow"><span>03</span> Useful when</p>
                <h2>The next step needs more than another off-the-shelf tool.</h2>
            </div>

            <div class="situation-grid">
                <article data-reveal>
                    <span>01</span>
                    <h3>Launching a digital product</h3>
                    <p>Shape the right first version and build toward real use.</p>
                </article>
                <article data-reveal>
                    <span>02</span>
                    <h3>Replacing manual work</h3>
                    <p>Turn repetitive steps and spreadsheets into a coherent workflow.</p>
                </article>
                <article data-reveal>
                    <span>03</span>
                    <h3>Connecting fragmented tools</h3>
                    <p>Make information and actions move cleanly between systems.</p>
                </article>
                <article data-reveal>
                    <span>04</span>
                    <h3>Extending a product team</h3>
                    <p>Add focused engineering capacity around a defined outcome.</p>
                </article>
            </div>
        </section>

        <section class="section approach" id="approach">
            <div class="section-heading" data-reveal>
                <p class="eyebrow"><span>04</span> How engagements work</p>
                <h2>Clarity first. Then forward motion.</h2>
            </div>

            <ol class="approach-list">
                <li data-reveal>
                    <span>01</span>
                    <div>
                        <h3>Frame the problem</h3>
                        <p>Clarify the outcome, users, constraints, and highest-risk assumptions.</p>
                    </div>
                </li>
                <li data-reveal>
                    <span>02</span>
                    <div>
                        <h3>Prototype the path</h3>
                        <p>Test the experience and technical direction before the full build.</p>
                    </div>
                </li>
                <li data-reveal>
                    <span>03</span>
                    <div>
                        <h3>Build and validate</h3>
                        <p>Deliver in understandable increments and validate against the workflow.</p>
                    </div>
                </li>
                <li data-reveal>
                    <span>04</span>
                    <div>
                        <h3>Release and evolve</h3>
                        <p>Put the system into use, learn from it, and improve deliberately.</p>
                    </div>
                </li>
            </ol>
        </section>

        <section class="section principles" id="principles">
            <div class="section-heading compact" data-reveal>
                <p class="eyebrow"><span>05</span> Working principles</p>
                <h2>Dependable software starts with dependable decisions.</h2>
            </div>

            <div class="principle-grid">
                <article data-reveal>
                    <h3>Clarity before complexity</h3>
                    <p>Understand the real problem before choosing the machinery.</p>
                </article>
                <article data-reveal>
                    <h3>Pragmatic engineering</h3>
                    <p>Use technology because it serves the outcome, not the other way around.</p>
                </article>
                <article data-reveal>
                    <h3>Close collaboration</h3>
                    <p>Keep decisions visible and the work connected to the people it affects.</p>
                </article>
                <article data-reveal>
                    <h3>Designed to evolve</h3>
                    <p>Build a strong first version without closing off what comes next.</p>
                </article>
            </div>
        </section>

        <section class="contact" id="contact">
            <div data-reveal>
                <p class="eyebrow"><span>06</span> Open a channel</p>
                <h2>Have an idea or operation that needs forward motion?</h2>
                <p>Start with an email. Tell us what you are trying to change.</p>
            </div>
            <a class="contact-link"
                href="mailto:hello@netria.dev?subject=Project%20conversation" data-reveal>
                <span>hello@netria.dev</span>
                <span aria-hidden="true">↗</span>
            </a>
        </section>
    </main>

    <footer class="footer">
        <a class="brand" href="#top" aria-label="Netria home">
            <picture>
                <source srcset="assets/netria-logo-footer-transparent.webp" type="image/webp">
                <img src="assets/netria-logo-footer-transparent.png" alt="" width="60" height="60">
            </picture>
            <span>Netria</span>
        </a>
        <div class="footer-links">
            <a href="#capabilities">Capabilities</a>
            <a href="#approach">Approach</a>
            <a href="#principles">Principles</a>
            <a href="mailto:hello@netria.dev">hello@netria.dev</a>
        </div>
        <p>© 2026 Netria. All rights reserved.</p>
    </footer>
</body>
</html>
```

Delete `i18n.js` with `apply_patch` so the retired localization code cannot ship.

- [ ] **Step 4: Run the content contract and verify it passes**

Run:

```bash
node --test tests/homepage-content.test.mjs
```

Expected: 6 tests pass, 0 fail.

- [ ] **Step 5: Commit the semantic content**

```bash
git add index.html tests/homepage-content.test.mjs
git add -u i18n.js
git commit -m "feat: replace homepage content and contact flow"
```

---

### Task 2: Implement the Quiet Signal Visual System

**Files:**
- Create: `tests/homepage-style.test.mjs`
- Modify: `styles.css:1-1180`

**Interfaces:**
- Consumes: classes, IDs, and `data-reveal` hooks from Task 1.
- Produces: responsive desktop/mobile presentation; `.nav-menu.is-open`; `[data-reveal].is-visible`; design tokens used by every visual component.

- [ ] **Step 1: Write the failing style contract**

Create `tests/homepage-style.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "styles.css"), "utf8");

test("defines the approved Quiet Signal tokens", () => {
  assert.match(css, /--color-bg:\s*#050706/);
  assert.match(css, /--color-signal:\s*#63ff72/i);
  assert.match(css, /--font-display:\s*"Space Grotesk"/);
  assert.match(css, /--font-mono:\s*"JetBrains Mono"/);
});

test("provides visible keyboard focus and a skip link", () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /outline:\s*2px solid var\(--color-signal\)/);
  assert.match(css, /\.skip-link/);
  assert.match(css, /\.skip-link:focus/);
});

test("supports mobile navigation and stacked content", () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /\.nav-menu\.is-open/);
  assert.match(css, /\.no-js \.nav-menu/);
  assert.match(css, /\.capability-grid/);
  assert.match(css, /grid-template-columns:\s*1fr/);
});

test("disables decorative motion when reduced motion is requested", () => {
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation-duration:\s*0\.01ms/);
  assert.match(css, /scroll-behavior:\s*auto/);
});

test("contains no retired light-theme component selectors", () => {
  assert.doesNotMatch(css, /\.contact-form|\.form-group|\.submit-button|\.lang-drawer/);
});
```

- [ ] **Step 2: Run the style contract and verify it fails**

Run:

```bash
node --test tests/homepage-style.test.mjs
```

Expected: failures for missing Quiet Signal tokens and retained form/language styles.

- [ ] **Step 3: Replace `styles.css` with the Quiet Signal stylesheet**

Use this complete stylesheet:

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}

:root {
    --color-bg: #050706;
    --color-surface: #0a0e0b;
    --color-surface-raised: #0e1510;
    --color-text: #f2f5f1;
    --color-muted: #95a097;
    --color-dim: #657068;
    --color-signal: #63ff72;
    --color-signal-dark: #193c1e;
    --color-border: rgba(99, 255, 114, 0.18);
    --color-border-strong: rgba(99, 255, 114, 0.45);
    --font-display: "Space Grotesk", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, monospace;
    --content-width: 1180px;
    --header-height: 76px;
    --section-space: clamp(5rem, 10vw, 9rem);
    --transition: 180ms ease;
}

html {
    scroll-behavior: smooth;
    background: var(--color-bg);
}

body {
    margin: 0;
    min-width: 320px;
    overflow-x: hidden;
    color: var(--color-text);
    background:
        radial-gradient(circle at 84% 10%, rgba(37, 132, 51, 0.14), transparent 28rem),
        var(--color-bg);
    font-family: var(--font-display);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

body.menu-open {
    overflow: hidden;
}

a {
    color: inherit;
}

img {
    display: block;
    max-width: 100%;
}

button,
a {
    -webkit-tap-highlight-color: transparent;
}

:focus-visible {
    outline: 2px solid var(--color-signal);
    outline-offset: 4px;
}

.skip-link {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 2000;
    padding: 0.7rem 1rem;
    color: var(--color-bg);
    background: var(--color-signal);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 700;
    text-decoration: none;
    transform: translateY(-160%);
    transition: transform var(--transition);
}

.skip-link:focus {
    transform: translateY(0);
}

.site-header {
    position: fixed;
    inset: 0 0 auto;
    z-index: 1000;
    border-bottom: 1px solid rgba(99, 255, 114, 0.1);
    background: rgba(5, 7, 6, 0.78);
    backdrop-filter: blur(18px);
}

.navbar {
    width: min(calc(100% - 2rem), var(--content-width));
    height: var(--header-height);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    text-decoration: none;
}

.brand picture,
.brand img {
    width: 34px;
    height: 34px;
}

.brand img {
    image-rendering: pixelated;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 2.5vw, 2rem);
    font-family: var(--font-mono);
    font-size: 0.75rem;
}

.nav-menu a {
    color: var(--color-muted);
    text-decoration: none;
    transition: color var(--transition);
}

.nav-menu a:hover {
    color: var(--color-text);
}

.nav-menu .nav-email {
    padding: 0.7rem 0.95rem;
    color: var(--color-bg);
    background: var(--color-signal);
    font-weight: 700;
}

.nav-menu .nav-email:hover {
    color: var(--color-bg);
    box-shadow: 0 0 26px rgba(99, 255, 114, 0.22);
}

.nav-toggle {
    display: none;
    width: 44px;
    height: 44px;
    padding: 10px;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    background: transparent;
    cursor: pointer;
}

.nav-toggle span {
    display: block;
    width: 100%;
    height: 1px;
    margin: 5px 0;
    background: currentColor;
    transition: transform var(--transition), opacity var(--transition);
}

.hero,
.section,
.contact,
.footer {
    width: min(calc(100% - 2rem), var(--content-width));
    margin-inline: auto;
}

.hero {
    position: relative;
    min-height: 100svh;
    padding: calc(var(--header-height) + 6rem) 0 5rem;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    align-items: center;
    gap: clamp(2rem, 7vw, 7rem);
}

.hero-copy {
    position: relative;
    z-index: 2;
}

.eyebrow {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin: 0 0 1.25rem;
    color: var(--color-signal);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.eyebrow span {
    color: var(--color-dim);
}

h1,
h2,
h3,
p {
    margin-top: 0;
}

h1,
h2 {
    letter-spacing: -0.065em;
}

h1 {
    max-width: 13ch;
    margin-bottom: 1.5rem;
    font-size: clamp(3.4rem, 7.4vw, 7rem);
    font-weight: 600;
    line-height: 0.92;
}

h1 em {
    color: var(--color-signal);
    font-style: normal;
}

.hero-summary {
    max-width: 56ch;
    margin-bottom: 2rem;
    color: var(--color-muted);
    font-size: clamp(1rem, 1.6vw, 1.2rem);
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.button {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    min-height: 50px;
    padding: 0.8rem 1rem;
    border: 1px solid var(--color-border-strong);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    text-decoration: none;
    transition: background var(--transition), color var(--transition), box-shadow var(--transition);
}

.button-primary {
    color: var(--color-bg);
    background: var(--color-signal);
}

.button-primary:hover {
    box-shadow: 0 0 32px rgba(99, 255, 114, 0.24);
}

.button-secondary {
    color: var(--color-text);
    background: rgba(10, 14, 11, 0.7);
}

.button-secondary:hover {
    background: var(--color-surface-raised);
}

.hero-signal {
    position: relative;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
}

.signal-grid {
    position: absolute;
    inset: 0;
    opacity: 0.3;
    background-image:
        linear-gradient(var(--color-border) 1px, transparent 1px),
        linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: radial-gradient(circle, black 20%, transparent 70%);
    animation: grid-drift 18s linear infinite;
}

.signal-orbit {
    position: absolute;
    border: 1px solid var(--color-border);
    border-radius: 50%;
}

.signal-orbit-large {
    width: 82%;
    height: 82%;
    animation: orbit-turn 28s linear infinite;
}

.signal-orbit-small {
    width: 56%;
    height: 56%;
    border-style: dashed;
    animation: orbit-turn 18s linear infinite reverse;
}

.signal-core {
    position: relative;
    z-index: 1;
    width: 54%;
    filter: drop-shadow(0 0 32px rgba(99, 255, 114, 0.24));
}

.signal-core img {
    width: 100%;
    height: auto;
    image-rendering: pixelated;
    mix-blend-mode: screen;
}

.signal-pixel {
    position: absolute;
    width: 6px;
    height: 6px;
    background: var(--color-signal);
    box-shadow: 0 0 14px var(--color-signal);
    animation: pixel-pulse 3s steps(2, end) infinite;
}

.signal-pixel-one {
    top: 18%;
    left: 20%;
}

.signal-pixel-two {
    right: 13%;
    bottom: 28%;
    animation-delay: 0.8s;
}

.signal-pixel-three {
    bottom: 12%;
    left: 32%;
    width: 4px;
    height: 4px;
    animation-delay: 1.4s;
}

.hero-status {
    position: absolute;
    inset: auto 0 1.25rem;
    display: flex;
    justify-content: space-between;
    padding-top: 0.8rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-dim);
    font-family: var(--font-mono);
    font-size: 0.65rem;
    text-transform: uppercase;
}

.section {
    padding: var(--section-space) 0;
    border-top: 1px solid var(--color-border);
}

.section-heading {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(240px, 0.55fr);
    align-items: end;
    gap: 2rem;
    margin-bottom: clamp(2.5rem, 6vw, 5rem);
}

.section-heading .eyebrow {
    grid-column: 1 / -1;
    margin-bottom: 0;
}

.section-heading h2 {
    max-width: 15ch;
    margin-bottom: 0;
    font-size: clamp(2.5rem, 5vw, 5rem);
    font-weight: 500;
    line-height: 1;
}

.section-heading > p:last-child {
    margin-bottom: 0.25rem;
    color: var(--color-muted);
}

.section-heading.compact {
    grid-template-columns: 1fr;
}

.section-heading.compact h2 {
    max-width: 18ch;
}

.capability-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.capability-card {
    position: relative;
    min-height: 470px;
    padding: clamp(1.5rem, 4vw, 3rem);
    overflow: hidden;
    border: 1px solid var(--color-border);
    background:
        linear-gradient(145deg, rgba(99, 255, 114, 0.06), transparent 40%),
        var(--color-surface);
    transition: border-color var(--transition), transform var(--transition);
}

.capability-card:hover {
    border-color: var(--color-border-strong);
    transform: translateY(-4px);
}

.capability-card::after {
    content: "";
    position: absolute;
    right: -4rem;
    bottom: -4rem;
    width: 12rem;
    height: 12rem;
    border: 1px solid var(--color-border);
    border-radius: 50%;
}

.card-index {
    margin-bottom: clamp(4rem, 9vw, 7rem);
    color: var(--color-signal);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
}

.capability-card h3 {
    margin-bottom: 1rem;
    font-size: clamp(2rem, 3vw, 3.25rem);
    font-weight: 500;
    letter-spacing: -0.05em;
}

.capability-card p {
    max-width: 46ch;
    color: var(--color-muted);
}

.capability-card ul {
    margin: 2rem 0 0;
    padding: 1.25rem 0 0;
    border-top: 1px solid var(--color-border);
    list-style: none;
    columns: 2;
}

.capability-card li {
    padding: 0.35rem 0;
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 0.72rem;
}

.capability-card li::before {
    content: "+";
    margin-right: 0.55rem;
    color: var(--color-signal);
}

.situation-grid,
.principle-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-top: 1px solid var(--color-border);
    border-left: 1px solid var(--color-border);
}

.situation-grid article,
.principle-grid article {
    min-height: 230px;
    padding: 1.5rem;
    border-right: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    background: rgba(10, 14, 11, 0.45);
}

.situation-grid span {
    display: block;
    margin-bottom: 4rem;
    color: var(--color-signal);
    font-family: var(--font-mono);
    font-size: 0.7rem;
}

.situation-grid h3,
.principle-grid h3 {
    font-size: 1.2rem;
    font-weight: 500;
    line-height: 1.2;
}

.situation-grid p,
.principle-grid p {
    margin-bottom: 0;
    color: var(--color-muted);
    font-size: 0.9rem;
}

.approach-list {
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-border);
    list-style: none;
}

.approach-list li {
    display: grid;
    grid-template-columns: minmax(70px, 0.25fr) minmax(0, 1fr);
    gap: 1rem;
    padding: 2rem 0;
    border-bottom: 1px solid var(--color-border);
}

.approach-list > li > span {
    color: var(--color-signal);
    font-family: var(--font-mono);
    font-size: 0.75rem;
}

.approach-list div {
    display: grid;
    grid-template-columns: minmax(220px, 0.7fr) minmax(240px, 1fr);
    gap: 2rem;
}

.approach-list h3 {
    margin-bottom: 0;
    font-size: clamp(1.4rem, 2.4vw, 2.2rem);
    font-weight: 500;
}

.approach-list p {
    max-width: 52ch;
    margin-bottom: 0;
    color: var(--color-muted);
}

.contact {
    padding: var(--section-space) clamp(1.5rem, 5vw, 4rem);
    border: 1px solid var(--color-border-strong);
    background:
        radial-gradient(circle at 90% 20%, rgba(99, 255, 114, 0.16), transparent 24rem),
        var(--color-surface);
}

.contact h2 {
    max-width: 14ch;
    font-size: clamp(2.6rem, 5.8vw, 5.6rem);
    font-weight: 500;
    line-height: 0.98;
}

.contact > div > p:last-child {
    color: var(--color-muted);
}

.contact-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 4rem;
    padding-top: 1.2rem;
    border-top: 1px solid var(--color-border-strong);
    color: var(--color-signal);
    font-family: var(--font-mono);
    font-size: clamp(1.1rem, 3vw, 2rem);
    text-decoration: none;
}

.footer {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 2rem;
    padding: 3rem 0;
    color: var(--color-dim);
    font-family: var(--font-mono);
    font-size: 0.68rem;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
}

.footer-links a {
    text-decoration: none;
}

.footer-links a:hover {
    color: var(--color-signal);
}

.footer p {
    margin: 0;
}

[data-reveal] {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 650ms ease, transform 650ms ease;
}

[data-reveal].is-visible {
    opacity: 1;
    transform: translateY(0);
}

@keyframes grid-drift {
    to {
        background-position: 32px 32px;
    }
}

@keyframes orbit-turn {
    to {
        transform: rotate(360deg);
    }
}

@keyframes pixel-pulse {
    50% {
        opacity: 0.25;
    }
}

@media (max-width: 900px) {
    :root {
        --header-height: 68px;
    }

    .nav-toggle {
        display: block;
        position: relative;
        z-index: 2;
    }

    .nav-toggle[aria-expanded="true"] span:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
    }

    .nav-toggle[aria-expanded="true"] span:nth-child(2) {
        opacity: 0;
    }

    .nav-toggle[aria-expanded="true"] span:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
    }

    .nav-menu {
        position: fixed;
        inset: var(--header-height) 0 auto;
        display: grid;
        gap: 0;
        padding: 1rem;
        border-bottom: 1px solid var(--color-border);
        background: rgba(5, 7, 6, 0.98);
        visibility: hidden;
        opacity: 0;
        transform: translateY(-12px);
        transition: opacity var(--transition), transform var(--transition), visibility var(--transition);
    }

    .nav-menu.is-open {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
    }

    .no-js .site-header {
        position: static;
    }

    .no-js .navbar {
        height: auto;
        padding-block: 0.75rem;
        flex-wrap: wrap;
    }

    .no-js .nav-toggle {
        display: none;
    }

    .no-js .nav-menu {
        position: static;
        width: 100%;
        margin-top: 0.75rem;
        visibility: visible;
        opacity: 1;
        transform: none;
    }

    .nav-menu a {
        padding: 1rem;
        border-bottom: 1px solid var(--color-border);
        font-size: 0.9rem;
    }

    .nav-menu .nav-email {
        margin-top: 0.75rem;
        text-align: center;
    }

    .hero {
        grid-template-columns: 1fr;
        padding-top: calc(var(--header-height) + 4rem);
    }

    .hero-signal {
        width: min(100%, 520px);
        margin: -2rem auto 2rem;
        order: 2;
    }

    .hero-status {
        position: static;
        grid-column: 1;
        order: 3;
    }

    .section-heading,
    .capability-grid,
    .approach-list div {
        grid-template-columns: 1fr;
    }

    .section-heading .eyebrow {
        grid-column: auto;
    }

    .situation-grid,
    .principle-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .footer {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .footer .brand,
    .footer-links {
        justify-self: center;
    }
}

@media (max-width: 600px) {
    .hero,
    .section,
    .contact,
    .footer,
    .navbar {
        width: min(calc(100% - 1.25rem), var(--content-width));
    }

    h1 {
        font-size: clamp(3rem, 15vw, 4.6rem);
    }

    .hero-actions,
    .button {
        width: 100%;
    }

    .signal-core {
        width: 62%;
    }

    .capability-card {
        min-height: 0;
    }

    .capability-card ul {
        columns: 1;
    }

    .situation-grid,
    .principle-grid {
        grid-template-columns: 1fr;
    }

    .approach-list li {
        grid-template-columns: 42px 1fr;
    }

    .contact {
        padding-inline: 1rem;
    }

    .contact-link {
        align-items: flex-start;
        font-size: 1rem;
        overflow-wrap: anywhere;
    }

    .footer-links {
        flex-wrap: wrap;
    }
}

@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    [data-reveal] {
        opacity: 1;
        transform: none;
    }
}
```

- [ ] **Step 4: Run the content and style contracts**

Run:

```bash
node --test tests/homepage-content.test.mjs tests/homepage-style.test.mjs
```

Expected: 11 tests pass, 0 fail.

- [ ] **Step 5: Commit the Quiet Signal system**

```bash
git add styles.css tests/homepage-style.test.mjs
git commit -m "feat: add quiet signal visual system"
```

---

### Task 3: Replace Legacy JavaScript with Progressive Behavior

**Files:**
- Create: `tests/homepage-behavior.test.mjs`
- Modify: `script.js:1-329`

**Interfaces:**
- Consumes: `#navToggle`, `#navMenu`, `.nav-menu.is-open`, `body.menu-open`, and `[data-reveal]`.
- Produces: `setMenuOpen(open: boolean): void` inside the module scope; updated `aria-expanded` and `aria-label`; `.is-visible` reveal state.

- [ ] **Step 1: Write the failing behavior contract**

Create `tests/homepage-behavior.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(join(root, "script.js"), "utf8");

test("contains only progressive navigation and reveal behavior", () => {
  assert.match(script, /function setMenuOpen\(open\)/);
  assert.match(script, /aria-expanded/);
  assert.match(script, /aria-label/);
  assert.match(script, /Escape/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /prefers-reduced-motion/);
  assert.match(script, /classList\.replace\("no-js", "js"\)/);
});

test("contains no retired form, analytics, or localization behavior", () => {
  assert.doesNotMatch(
    script,
    /FormData|fetch\(|isValidEmail|showNotification|contactForm|i18n|languageChanged|langDrawer/i
  );
});

test("keeps the behavior file intentionally small", () => {
  assert.ok(Buffer.byteLength(script, "utf8") < 5000);
});
```

- [ ] **Step 2: Run the behavior contract and verify it fails**

Run:

```bash
node --test tests/homepage-behavior.test.mjs
```

Expected: failures because legacy form and localization behavior remains and `setMenuOpen` is absent.

- [ ] **Step 3: Replace `script.js` with minimal progressive behavior**

Use this complete script:

```js
document.documentElement.classList.replace("no-js", "js");

const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const menuLinks = navMenu ? [...navMenu.querySelectorAll("a")] : [];

function setMenuOpen(open) {
    if (!navToggle || !navMenu) {
        return;
    }

    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    navMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
}

if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        setMenuOpen(!isOpen);
    });

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuOpen(false);
            navToggle.focus();
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";

        if (
            isOpen &&
            target instanceof Node &&
            !navMenu.contains(target) &&
            !navToggle.contains(target)
        ) {
            setMenuOpen(false);
        }
    });

    const desktopQuery = window.matchMedia("(min-width: 901px)");
    desktopQuery.addEventListener("change", (event) => {
        if (event.matches) {
            setMenuOpen(false);
        }
    });
}

const revealItems = [...document.querySelectorAll("[data-reveal]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -48px",
        }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
}
```

- [ ] **Step 4: Verify syntax and behavior contracts**

Run:

```bash
node --check script.js
node --test tests/homepage-behavior.test.mjs tests/homepage-content.test.mjs
```

Expected: syntax check exits 0; 9 tests pass, 0 fail.

- [ ] **Step 5: Commit progressive behavior**

```bash
git add script.js tests/homepage-behavior.test.mjs
git commit -m "feat: simplify homepage interactions"
```

---

### Task 4: Refresh the Social Preview

**Files:**
- Create: `assets/og-image.svg`
- Modify: `assets/og-image.png`
- Create: `tests/homepage-assets.test.mjs`

**Interfaces:**
- Consumes: the approved Quiet Signal tokens and `assets/netria-logo-navbar-transparent.png`.
- Produces: a maintainable 1200×630 SVG source and a 1200×630 PNG referenced by Task 1 metadata.

- [ ] **Step 1: Write the failing asset contract**

Create `tests/homepage-assets.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "assets", "og-image.svg");
const pngPath = join(root, "assets", "og-image.png");

test("has a maintainable Quiet Signal social source", () => {
  assert.equal(existsSync(svgPath), true);
  const svg = readFileSync(svgPath, "utf8");
  assert.match(svg, /width="1200"/);
  assert.match(svg, /height="630"/);
  assert.match(svg, /#050706/i);
  assert.match(svg, /#63ff72/i);
  assert.match(svg, /Custom Software \+ Workflow Automation/);
});

test("ships a 1200 by 630 PNG", () => {
  const output = execFileSync(
    "sips",
    ["-g", "pixelWidth", "-g", "pixelHeight", pngPath],
    { encoding: "utf8" }
  );

  assert.match(output, /pixelWidth:\s+1200/);
  assert.match(output, /pixelHeight:\s+630/);
});
```

- [ ] **Step 2: Run the asset contract and verify it fails**

Run:

```bash
node --test tests/homepage-assets.test.mjs
```

Expected: the SVG source test fails because `assets/og-image.svg` does not exist.

- [ ] **Step 3: Create the complete SVG source**

Create `assets/og-image.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#63ff72" stroke-opacity=".09"/>
    </pattern>
    <radialGradient id="glow" cx="72%" cy="44%" r="54%">
      <stop offset="0" stop-color="#194521"/>
      <stop offset=".48" stop-color="#09110b"/>
      <stop offset="1" stop-color="#050706"/>
    </radialGradient>
    <filter id="signalGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="#050706"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <g font-family="'JetBrains Mono', monospace" fill="#63ff72">
    <text x="70" y="75" font-size="20" font-weight="700">NETRIA / SIGNAL 01</text>
    <text x="70" y="552" font-size="17" fill-opacity=".64">CUSTOM SYSTEMS · BUILT TO EVOLVE</text>
  </g>

  <g font-family="'Space Grotesk', system-ui, sans-serif" fill="#f2f5f1">
    <text x="70" y="228" font-size="78" font-weight="600" letter-spacing="-4">
      Software for ideas
    </text>
    <text x="70" y="310" font-size="78" font-weight="600" letter-spacing="-4">
      and operations
    </text>
    <text x="70" y="392" font-size="78" font-weight="600" letter-spacing="-4" fill="#63ff72">
      in motion.
    </text>
    <text x="70" y="458" font-size="24" fill="#95a097">
      Custom Software + Workflow Automation
    </text>
  </g>

  <circle cx="960" cy="315" r="180" fill="none" stroke="#63ff72" stroke-opacity=".26"/>
  <circle cx="960" cy="315" r="128" fill="none" stroke="#63ff72" stroke-opacity=".18"
      stroke-dasharray="8 14"/>
  <image href="netria-logo-navbar-transparent.png" x="850" y="205" width="220" height="220"
      image-rendering="pixelated" filter="url(#signalGlow)"/>

  <rect x="846" y="158" width="8" height="8" fill="#63ff72"/>
  <rect x="1082" y="394" width="6" height="6" fill="#63ff72"/>
  <rect x="815" y="425" width="4" height="4" fill="#63ff72"/>

  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="#63ff72"
      stroke-opacity=".22"/>
</svg>
```

- [ ] **Step 4: Generate the PNG and verify both assets**

Run:

```bash
sips -s format png assets/og-image.svg --out assets/og-image.png
node --test tests/homepage-assets.test.mjs
```

Expected: `sips` reports `assets/og-image.png`; 2 asset tests pass, 0 fail.

Visually inspect `assets/og-image.png` and verify:

- the existing pixel moth renders in the right-hand orbit;
- no text is clipped;
- signal green remains an accent against the near-black background;
- the image reads at small preview size.

- [ ] **Step 5: Commit the social preview**

```bash
git add assets/og-image.svg assets/og-image.png tests/homepage-assets.test.mjs
git commit -m "feat: refresh homepage social preview"
```

---

### Task 5: Update Documentation and Run Full Validation

**Files:**
- Create: `tests/readme.test.mjs`
- Modify: `README.md:1-212`

**Interfaces:**
- Consumes: the final content, style, behavior, and asset architecture from Tasks 1–4.
- Produces: accurate contributor documentation and final release evidence.

- [ ] **Step 1: Write the failing documentation contract**

Create `tests/readme.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readme = readFileSync(join(root, "README.md"), "utf8");

test("documents the current homepage", () => {
  assert.match(readme, /Custom software and workflow automation/);
  assert.match(readme, /Quiet Signal/);
  assert.match(readme, /hello@netria\.dev/);
  assert.match(readme, /node --test tests\/\*\.test\.mjs/);
});

test("does not document retired features or positioning", () => {
  assert.doesNotMatch(
    readme,
    /Morocco|Moroccan|Maroc|contact form|Formspree|Plausible|language selector|i18n\.js/i
  );
});
```

- [ ] **Step 2: Run the documentation contract and verify it fails**

Run:

```bash
node --test tests/readme.test.mjs
```

Expected: failures because the README still documents the old positioning, form, localization, and analytics.

- [ ] **Step 3: Replace `README.md` with current documentation**

Use this complete document:

```markdown
# Netria Company Page

A lightweight static homepage for Netria's custom software and workflow automation practice.

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
- restrained grids, particles, and orbital geometry;
- geometric display typography with technical monospace labels;
- conventional scrolling and reduced-motion support.

## Contact

The site has no contact form. Visitors contact Netria directly at [hello@netria.dev](mailto:hello@netria.dev).

## Project Structure

```text
.
├── assets/                  # Logos, favicons, and social artwork
├── docs/superpowers/        # Approved design and implementation plan
├── tests/                   # Dependency-free Node contract tests
├── CNAME                    # Custom-domain configuration
├── index.html               # Semantic page content and metadata
├── script.js                # Mobile navigation and progressive reveals
└── styles.css               # Quiet Signal visual system
```

## Local Development

From the project root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Validation

Run all contract tests:

```bash
node --test tests/*.test.mjs
```

Check JavaScript syntax and whitespace:

```bash
node --check script.js
git diff --check
```

The page should also be checked at 320px, 768px, 1024px, and 1440px widths, with keyboard navigation and reduced motion enabled.

## Deployment

The repository is deployed as a static site. `CNAME` preserves the custom `netria.dev` domain.
```

- [ ] **Step 4: Run the complete automated verification suite**

Run:

```bash
node --check script.js
node --test tests/*.test.mjs
git diff --check
rg -n "Morocco|Moroccan|Maroc|المغرب|Kenitra|Kénitra|Formspree|formspree|Plausible|plausible|data-i18n|i18n\\.js" index.html styles.css script.js README.md
```

Expected:

- `node --check` exits 0;
- 18 tests pass, 0 fail;
- `git diff --check` exits 0;
- `rg` exits 1 with no matches.

- [ ] **Step 5: Verify the served page**

Start the local server:

```bash
python3 -m http.server 8000
```

From another terminal, run:

```bash
curl -sS http://127.0.0.1:8000/ | rg "Software for ideas and operations in motion|mailto:hello@netria.dev"
curl -sS -I http://127.0.0.1:8000/styles.css
curl -sS -I http://127.0.0.1:8000/script.js
curl -sS -I http://127.0.0.1:8000/assets/og-image.png
```

Expected:

- the HTML check prints the approved headline and email links;
- each asset request returns `HTTP/1.0 200 OK`.

Inspect the page at 320px, 768px, 1024px, and 1440px widths. At each width verify:

- no horizontal overflow or clipped text;
- the hero hierarchy and moth remain legible;
- both capability paths have equal visual weight;
- section links land below the fixed header;
- mobile menu opens, closes, and responds to Escape;
- all links can be reached with the keyboard;
- focus is visibly signal green;
- the visible email can be selected and copied;
- disabling JavaScript leaves all content and links usable;
- reduced motion removes grid, orbit, pixel, and reveal animation.

- [ ] **Step 6: Commit documentation and validation**

```bash
git add README.md tests/readme.test.mjs
git commit -m "docs: update homepage development guide"
```

- [ ] **Step 7: Record final repository evidence**

Run:

```bash
node --check script.js
node --test tests/*.test.mjs
git diff --check
git status --short
git log -5 --oneline
```

Expected:

- JavaScript syntax exits 0;
- 18 tests pass, 0 fail;
- no whitespace errors;
- only pre-existing unrelated changes or explicitly ignored visual-companion files remain;
- the five implementation commits are visible in order.
