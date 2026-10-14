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

test("the homepage scrolls like a normal document", () => {
  assert.doesNotMatch(css, /html\.paged|#fx-wave|scroll-cue|pixel-blink|scene--active|scene--entering/);
  assert.doesNotMatch(css, /\[data-reveal\]/);
  // Layers sit behind their section's content and above the page background.
  assert.match(css, /\.scene\s*\{[^}]*position:\s*relative;[^}]*isolation:\s*isolate;/s);
  // Capabilities and principles layers break out of the content column to the viewport edges.
  // !important: signal.js sizes every layer canvas with an inline width of 100%.
  assert.match(
    css,
    /\.capabilities > \.scene-fx\s*\{[^}]*left:\s*calc\(50% - 50vw\);[^}]*width:\s*100vw !important;/s
  );
  assert.match(css, /main\s*\{[^}]*overflow-x:\s*clip;/s);
  // Deep links land below the fixed header.
  assert.match(css, /\.section\s*\{[^}]*scroll-margin-top:\s*var\(--header-height\)/s);
});

test("constrains the mobile hero to the viewport", () => {
  assert.match(css, /\.hero-copy\s*\{[^}]*min-width:\s*0/s);
  assert.match(
    css,
    /@media\s*\(max-width:\s*600px\)[\s\S]*h1\s*\{[^}]*font-size:\s*clamp\(2\.8rem,\s*13vw,\s*4\.6rem\)/
  );
});

test("contains no retired light-theme component selectors", () => {
  assert.doesNotMatch(css, /\.contact-form|\.form-group|\.submit-button|\.lang-drawer/);
});
test("the process list stacks on tablets", () => {
  assert.match(css, /\.hero-summary\s*\{/);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*\.capability-grid,\s*\.approach-list div\s*\{\s*grid-template-columns:\s*1fr;/);
});

test("process steps line up: a narrow number column and a shared baseline", () => {
  assert.match(css, /\.approach-list li\s*\{[^}]*grid-template-columns:\s*3rem minmax\(0, 1fr\);[^}]*align-items:\s*baseline;/s);
  assert.match(css, /\.approach-list div\s*\{[^}]*align-items:\s*baseline;/s);
  assert.doesNotMatch(css, /42px 1fr/);
});

test("the copy button hides without JavaScript and confirms a copy", () => {
  assert.match(css, /\.no-js \.copy-email\s*\{\s*display:\s*none;/);
  assert.match(css, /\.article-body \.heading-link\[data-copied\]::after,\s*\.copy-email\[data-copied\]::after\s*\{/);
});

test("old card anchors land below the fixed header", () => {
  assert.match(css, /\.capability-grid,\s*\.capability-card,\s*\.approach-list\s*\{\s*scroll-margin-top:\s*calc\(var\(--header-height\) \+ 1\.5rem\);/);
  assert.doesNotMatch(css, /principle-grid|\.principles\b/);
});

const token = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))[1];
const contrast = (a, b) => {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("text colours meet WCAG AA contrast on the page background", () => {
  for (const name of ["color-text", "color-muted", "color-dim"]) {
    assert.ok(contrast(token(name), token("color-bg")) >= 4.5, `${name} is ${contrast(token(name), token("color-bg")).toFixed(2)}:1`);
  }
});

test("small labels use the pixel font's native 12px, small mono text 13px", () => {
  // Fusion Pixel is drawn on a 12px grid: other small sizes blur.
  for (const sel of ["\\.nav-menu", "\\.eyebrow", "\\.button", "\\.card-index", "\\.approach-list > li > span", "\\.footer"]) {
    assert.match(css, new RegExp(`\\n${sel}\\s*\\{[^}]*font-size:\\s*0\\.75rem;`), sel);
  }
  for (const sel of ["\\.capability-card li", "\\.founder-name span", "\\.founder-link", "\\.copy-email"]) {
    assert.match(css, new RegExp(`\\n${sel}\\s*\\{[^}]*font-size:\\s*0\\.8125rem;`), sel);
  }
});

test("section headings use the full content width", () => {
  assert.match(css, /\.section-heading\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/s);
  assert.match(css, /\.section-heading h2\s*\{[^}]*max-width:\s*36ch;/s);
  assert.match(css, /\.contact h2\s*\{[^}]*max-width:\s*24ch;/s);
});

test("the About link lands on the founder below the fixed header", () => {
  assert.match(css, /\.founder\s*\{[^}]*scroll-margin-top:\s*calc\(var\(--header-height\) \+ 1\.5rem\);/s);
});
