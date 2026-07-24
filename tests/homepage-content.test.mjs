import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const authoredText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

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
  for (const id of ["capabilities", "situations", "approach", "contact"]) {
    assert.match(html, new RegExp(`<section[^>]+id="${id}"`));
  }

  assert.match(authoredText, /Software for ideas and operations in motion\./);
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
