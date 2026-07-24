import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const scenes = readFileSync(new URL("../scenes.js", import.meta.url), "utf8");

test("main stage contains exactly five scenes with stable ids", () => {
  const ids = [
    ...html.matchAll(/<section class="[^"]*\bscene\b[^"]*" id="([^"]+)"/g),
  ].map((m) => m[1]);
  assert.deepEqual(ids, ["top", "capabilities", "situations", "approach", "contact"]);
});

test("footer content lives inside the contact scene exactly once", () => {
  assert.equal((html.match(/<footer class="footer">/g) || []).length, 1);
  const contact = html.slice(html.indexOf('id="contact"'));
  assert.match(contact, /<footer class="footer">/);
  assert.match(contact, /© 2026 Netria\. All rights reserved\./);
});

test("merged scene pairs situations and principles with renumbered eyebrows", () => {
  const merged = html.slice(html.indexOf('id="situations"'), html.indexOf('id="approach"'));
  assert.match(merged, /<span>03<\/span> Useful when/);
  assert.match(merged, /<span>04<\/span> Working principles/);
  assert.match(merged, /principle-grid/);
  assert.match(html.slice(html.indexOf('id="approach"')), /<span>05<\/span> How engagements work/);
  assert.match(html.slice(html.indexOf('id="contact"')), /<span>06<\/span> Open a channel/);
});

test("hero is the default active scene and carries a scroll cue", () => {
  const hero = html.slice(html.indexOf('<section class="hero'), html.indexOf('id="capabilities"'));
  assert.match(hero, /scene--active/);
  assert.match(hero, /class="scroll-cue"/);
});

test("loads scenes.js progressively and retires effects.js and data-reveal", () => {
  assert.match(html, /<script src="scenes\.js" defer><\/script>/);
  assert.doesNotMatch(html, /effects\.js/);
  assert.doesNotMatch(html, /data-reveal/);
});

test("shell locks native scroll only when js is on", () => {
  assert.match(css, /html\.js,\s*\r?\n?html\.js body\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /html\.js,\s*\r?\n?html\.js body\s*\{[^}]*touch-action:\s*none/s);
  assert.match(css, /html\.js main\s*\{[^}]*100svh/s);
  assert.match(css, /html\.js \.scene\s*\{[^}]*position:\s*absolute/s);
  assert.match(css, /html\.js \.scene--active\s*\{[^}]*visibility:\s*visible/s);
  assert.match(css, /html\.js \.scene--entering\s*\{[^}]*z-index:\s*2/s);
  assert.match(css, /#fx-wave\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /html\.js #fx-wave\.is-on\s*\{[^}]*display:\s*block/s);
});

test("dissolve blocks hide only when motion is allowed", () => {
  assert.match(
    css,
    /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{[^@]*html\.js \[data-dissolve\]\s*\{[^}]*opacity:\s*0/s
  );
  assert.doesNotMatch(css, /\[data-reveal\]/);
});

test("scenes.js stays lean and clean", () => {
  assert.ok(Buffer.byteLength(scenes, "utf8") < 18000);
  assert.doesNotMatch(scenes, /fetch\(|FormData|analytics|i18n|contactForm|langDrawer/);
});

test("pager implements kimi wheel semantics", () => {
  assert.match(scenes, /passive:\s*false/);
  assert.match(scenes, /preventDefault\(\)/);
  assert.match(scenes, /WHEEL_THRESHOLD\s*=\s*6/);
  assert.match(scenes, /WHEEL_IDLE_MS\s*=\s*180/);
  assert.match(scenes, /TOUCH_MIN\s*=\s*40/);
});

test("hash deep-linking, history, and nav are wired", () => {
  assert.match(scenes, /pushState/);
  assert.match(scenes, /popstate/);
  assert.match(scenes, /aria-current/);
  assert.match(scenes, /principles/);
});

test("exposes the scene test hook", () => {
  assert.match(scenes, /window\.__scenes/);
  assert.match(scenes, /goTo/);
});

test("no intersection observers remain", () => {
  assert.doesNotMatch(scenes, /IntersectionObserver/);
});
