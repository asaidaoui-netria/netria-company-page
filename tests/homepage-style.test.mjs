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
    /\.capabilities > \.scene-fx,\s*\.principles > \.scene-fx\s*\{[^}]*left:\s*calc\(50% - 50vw\);[^}]*width:\s*100vw !important;/s
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

test("the principles number field stays behind readable text", () => {
  assert.match(css, /\.principles > \.scene-fx\s*\{[^}]*mask-image:[^}]*rgb\(0 0 0 \/ 0\.1\)\)/s);
  assert.match(css, /\.principles:has\(> \.scene-fx\) \.section-heading\s*\{[^}]*text-shadow:/s);
});

test("the process list stacks on tablets and keeps a narrow index column on phones", () => {
  assert.match(css, /\.hero-summary\s*\{/);
  assert.match(css, /\.approach-list li\s*\{[^}]*grid-template-columns:\s*minmax\(70px, 0\.25fr\) minmax\(0, 1fr\)/s);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*\.capability-grid,\s*\.approach-list div\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)[\s\S]*\.approach-list li\s*\{\s*grid-template-columns:\s*42px 1fr;/);
});

test("the copy button hides without JavaScript and confirms a copy", () => {
  assert.match(css, /\.no-js \.copy-email\s*\{\s*display:\s*none;/);
  assert.match(css, /\.article-body \.heading-link\[data-copied\]::after,\s*\.copy-email\[data-copied\]::after\s*\{/);
});

test("old card anchors land below the fixed header", () => {
  assert.match(css, /\.capability-grid,\s*\.capability-card\s*\{\s*scroll-margin-top:\s*calc\(var\(--header-height\) \+ 1\.5rem\);/);
});
