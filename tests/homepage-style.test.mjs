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
