import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const signal = readFileSync(new URL("../signal.js", import.meta.url), "utf8");
const base = readFileSync(new URL("../_includes/base.njk", import.meta.url), "utf8");
const article = readFileSync(new URL("../_includes/article.njk", import.meta.url), "utf8");

test("scene fx load as a module on top of the static page", () => {
  assert.match(html, /<script src="signal\.js" type="module"><\/script>/);
  assert.match(html, /class="signal-core"/);
  assert.match(html, /<span class="contact-scope" aria-hidden="true"><\/span>/);
  assert.match(css, /\.scene > \.scene-fx\s*\{[^}]*z-index:\s*-1/s);
});

test("every scene gets exactly one layer, and articles get the divider trace", () => {
  const hosts = [...signal.matchAll(/^\s{8}host: "([^"]+)"/gm)].map((m) => m[1]);
  assert.deepEqual(hosts, [".contact-scope", ".article-scope"]);
  for (const host of hosts) {
    const id = host.startsWith("#") ? host.slice(1) : null;
    const pages = html + article;
    assert.ok(id ? pages.includes(`id="${id}"`) : pages.includes(`class="${host.slice(1)}`), host);
  }
  assert.match(signal, /LAYERS\.filter\(present\)[\s\S]*await import\(SHADERS_URL\)/);
});

test("shaders bundle is self-hosted, version-pinned, lazy, shared and telemetry-free", () => {
  assert.match(signal, /const SHADERS_URL = "\/assets\/vendor\/shaders@\d+\.\d+\.\d+\/bundle\.js"/);
  assert.match(readFileSync(new URL(`..${signal.match(/const SHADERS_URL = "([^"]+)"/)[1].replace("bundle.js", "LICENSE")}`, import.meta.url), "utf8"), /^MIT License/);
  assert.match(signal, /await import\(SHADERS_URL\)/);
  assert.match(signal, /createSharedDevice\(\)/);
  assert.match(signal, /disableTelemetry:\s*true/);
});

test("every page that loads the bundle pins it with the same integrity hash", () => {
  const url = signal.match(/const SHADERS_URL = "([^"]+)"/)[1];
  const hashes = [html, base].map((page) => {
    const map = JSON.parse(page.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
    assert.ok(page.indexOf('type="importmap"') < page.search(/src="\/?signal\.js"/));
    return map.integrity[url];
  });
  assert.match(hashes[0] ?? "", /^sha384-[A-Za-z0-9+/]{64}$/);
  assert.equal(hashes[1], hashes[0]);
  const file = readFileSync(new URL(`..${url}`, import.meta.url));
  assert.equal(`sha384-${createHash("sha384").update(file).digest("base64")}`, hashes[0]);
});

test("fx are gated on webgpu, a fine pointer and motion, and fail back to static", () => {
  assert.match(signal, /"gpu" in navigator/);
  assert.match(signal, /\(pointer: fine\)/);
  assert.match(signal, /prefers-reduced-motion: reduce/);
  assert.match(signal, /offsetWidth > 0/);
  assert.match(signal, /getFailureReason\(\)/);
  assert.match(signal, /canvas\.remove\(\)/);
});

test("layers leave off-screen pausing to the renderer", () => {
  assert.doesNotMatch(signal, /scene--active|scene--entering|MutationObserver|closest\("\.scene"\)/);
});

test("the principles number field is retired with its section", () => {
  assert.doesNotMatch(signal, /#principles|VT323|Severance/);
});

test("the capabilities section has no background layer", () => {
  assert.doesNotMatch(signal, /#capabilities|Perspective|"floor"/);
  assert.match(html, /<section class="section capabilities" id="capabilities">/);
  assert.doesNotMatch(css, /\.capabilities > \.scene-fx|50vw/);
});
