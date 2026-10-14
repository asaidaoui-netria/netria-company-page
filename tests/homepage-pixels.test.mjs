import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STATIC, VERSIONED } from "../eleventy.config.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const pixels = readFileSync(new URL("../pixels.js", import.meta.url), "utf8");
const signal = readFileSync(new URL("../signal.js", import.meta.url), "utf8");

test("the moth pixels load as a module on the homepage, published and cache-versioned", () => {
  assert.match(html, /<script src="pixels\.js" type="module"[^>]*><\/script>/);
  assert.ok(STATIC.includes("pixels.js") && VERSIONED.includes("pixels.js"));
});

test("the pixels run only with WebGL2 and motion allowed, and leave the static page otherwise", () => {
  assert.match(pixels, /prefers-reduced-motion: reduce/);
  assert.match(pixels, /getContext\("webgl2"/);
  // Nothing is added to the page until the GPU program has compiled.
  assert.ok(pixels.indexOf("= compile(gl)") < pixels.indexOf("document.body.prepend("));
  assert.match(pixels, /catch\(/);
});

test("the static moth never shows when the pixels will run, and comes back when they can't", () => {
  // Decided before the first paint, so the static moth never swaps for the pixel one.
  const head = html.match(/<script>([^<]*)<\/script>/)[1];
  assert.match(head, /WebGL2RenderingContext/);
  assert.match(head, /prefers-reduced-motion: reduce/);
  assert.match(head, /classList\.add\("pixels-live"\)/);
  assert.match(css, /\.pixels-live \.signal-core,\s*\.pixels-live \.signal-grid\s*\{[^}]*visibility:\s*hidden/s);
  // A script that never loads, or stops later, hands the static moth back.
  assert.match(html, /<script src="pixels\.js" type="module" onerror="document\.documentElement\.classList\.remove\('pixels-live'\)"><\/script>/);
  assert.match(pixels, /function stop\(\) \{[^}]*classList\.remove\("pixels-live"\)/);
  assert.doesNotMatch(pixels, /signal-live/);
  assert.doesNotMatch(signal, /\.hero-signal|PixelThrow/);
});

test("on load the pixels fly in and assemble the moth", () => {
  assert.match(pixels, /uIntro/);
});

test("the pixel field sits behind the page and never takes a click", () => {
  assert.match(css, /\.pixel-field\s*\{[^}]*position:\s*fixed;[^}]*z-index:\s*-1;[^}]*pointer-events:\s*none;/s);
});

test("cards turn to frosted glass, and the contact clears, only while the pixels run", () => {
  assert.match(css, /\.pixels-live \.capability-card\s*\{[^}]*backdrop-filter:\s*blur\(/s);
  assert.match(css, /\.pixels-live \.contact\s*\{[^}]*background:/s);
  assert.doesNotMatch(css, /\n\.capability-card\s*\{[^}]*backdrop-filter/s);
});

test("the shapes follow each card's real size, including after fonts load", () => {
  assert.match(pixels, /new ResizeObserver\(/);
  assert.match(pixels, /cards\.forEach\(\(card\) => \w+\.observe\(card\)\)/);
});

test("the static page comes back if the GPU context is lost or a frame fails", () => {
  assert.match(pixels, /addEventListener\("webglcontextlost", stop\)/);
  assert.match(pixels, /try \{[\s\S]*gl\.drawArrays[\s\S]*\} catch \{\s*stop\(\);/);
  assert.match(pixels, /start\(\)\.catch\(stop\)/);
});

test("the cursor pushes pixels only on devices with a fine pointer", () => {
  assert.match(pixels, /\(pointer: fine\)/);
});
