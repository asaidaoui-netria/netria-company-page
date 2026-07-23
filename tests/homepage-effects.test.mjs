import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const effectsPath = join(root, "effects.js");

test("tags display headings for decode and visual blocks for dissolve", () => {
  assert.match(html, /<h1 data-decode>/);
  assert.equal((html.match(/<h2 data-decode>/g) ?? []).length, 5);
  assert.match(html, /<div class="hero-signal" aria-hidden="true" data-reveal data-dissolve>/);
  assert.equal(
    (html.match(/<article class="capability-card" data-reveal data-dissolve>/g) ?? []).length,
    2
  );
  assert.match(html, /<section class="contact" id="contact" data-dissolve>/);
});

test("loads the effects module progressively", () => {
  assert.match(html, /<script src="script\.js" defer><\/script>\s*<script src="effects\.js" defer><\/script>/);
  assert.equal(existsSync(effectsPath), true);
});
