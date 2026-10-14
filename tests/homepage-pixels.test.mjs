import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STATIC, VERSIONED } from "../eleventy.config.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const pixels = readFileSync(new URL("../pixels.js", import.meta.url), "utf8");
const signal = readFileSync(new URL("../signal.js", import.meta.url), "utf8");

test("the moth pixels load as a module on the homepage, published and cache-versioned", () => {
  assert.match(html, /<script src="pixels\.js" type="module"><\/script>/);
  assert.ok(STATIC.includes("pixels.js") && VERSIONED.includes("pixels.js"));
});

test("the pixels run only with WebGL2 and motion allowed, and leave the static page otherwise", () => {
  assert.match(pixels, /prefers-reduced-motion: reduce/);
  assert.match(pixels, /getContext\("webgl2"/);
  // Nothing is added to the page until the GPU program has compiled.
  assert.ok(pixels.indexOf("= compile(gl)") < pixels.indexOf("document.body.prepend("));
  assert.match(pixels, /catch\(/);
});

test("the pixel moth replaces the hero's static moth only once it runs", () => {
  assert.match(pixels, /\.hero-signal"\)\.classList\.add\("signal-live"\)/);
  assert.match(pixels, /classList\.add\("pixels-live"\)/);
  assert.doesNotMatch(signal, /\.hero-signal|PixelThrow/);
});

test("the pixel field sits behind the page and never takes a click", () => {
  assert.match(css, /\.pixel-field\s*\{[^}]*position:\s*fixed;[^}]*z-index:\s*-1;[^}]*pointer-events:\s*none;/s);
});

test("cards turn to frosted glass, and the contact clears, only while the pixels run", () => {
  assert.match(css, /\.pixels-live \.capability-card\s*\{[^}]*backdrop-filter:\s*blur\(/s);
  assert.match(css, /\.pixels-live \.contact\s*\{[^}]*background:/s);
  assert.doesNotMatch(css, /\n\.capability-card\s*\{[^}]*backdrop-filter/s);
});

test("the shapes follow the cards' real size, including after fonts load", () => {
  assert.match(pixels, /new ResizeObserver\(/);
});

test("the cursor pushes pixels only on devices with a fine pointer", () => {
  assert.match(pixels, /\(pointer: fine\)/);
});
