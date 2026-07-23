import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readme = readFileSync(join(root, "README.md"), "utf8");

test("documents the current homepage", () => {
  assert.match(readme, /Custom software and workflow automation/);
  assert.match(readme, /Quiet Signal/);
  assert.match(readme, /hello@netria\.dev/);
  assert.match(readme, /node --test tests\/\*\.test\.mjs/);
});

test("does not document retired features or positioning", () => {
  assert.doesNotMatch(
    readme,
    /Morocco|Moroccan|Maroc|contact form|Formspree|Plausible|language selector|i18n\.js/i
  );
});
