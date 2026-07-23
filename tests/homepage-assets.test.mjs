import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "assets", "og-image.svg");
const pngPath = join(root, "assets", "og-image.png");

test("has a maintainable Quiet Signal social source", () => {
  assert.equal(existsSync(svgPath), true);
  const svg = readFileSync(svgPath, "utf8");
  assert.match(svg, /width="1200"/);
  assert.match(svg, /height="630"/);
  assert.match(svg, /#050706/i);
  assert.match(svg, /#63ff72/i);
  assert.match(svg, /Custom Software \+ Workflow Automation/);
});

test("ships a 1200 by 630 PNG", () => {
  const output = execFileSync(
    "sips",
    ["-g", "pixelWidth", "-g", "pixelHeight", pngPath],
    { encoding: "utf8" }
  );

  assert.match(output, /pixelWidth:\s+1200/);
  assert.match(output, /pixelHeight:\s+630/);
});
