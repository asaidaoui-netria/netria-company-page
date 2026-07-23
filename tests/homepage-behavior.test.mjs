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
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /prefers-reduced-motion/);
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
