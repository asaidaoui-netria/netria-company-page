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
  assert.doesNotMatch(script, /IntersectionObserver/);
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

test("copy buttons and section links share one clipboard handler that fails quietly", () => {
  assert.match(script, /querySelectorAll\("\.heading-link, \[data-copy\]"\)/);
  // A button names the element whose text it copies; a section link copies its own address.
  assert.match(script, /const target = el\.dataset\.copy && document\.getElementById\(el\.dataset\.copy\);/);
  assert.match(script, /navigator\.clipboard\.writeText\(text\)/);
  assert.match(script, /\} catch \{/);
  // Refused: select the address so the keyboard can copy it.
  assert.match(script, /getSelection\(\)\.selectAllChildren\(target\)/);
});

test("copy results are announced every time, naming what was copied", () => {
  assert.match(script, /"Address copied"/);
  assert.match(script, /"Link copied"/);
  assert.match(script, /"Address selected/);
  // Clearing first and refilling on the next frame makes a repeat copy announce again.
  assert.match(script, /status\.textContent = "";\s*requestAnimationFrame\(/);
});
