import test from "node:test";
import assert from "node:assert/strict";
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
  // Width and height sit in the IHDR chunk right after the 8-byte signature.
  const png = readFileSync(pngPath);
  assert.equal(png.toString("ascii", 12, 16), "IHDR");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});
