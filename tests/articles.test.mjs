import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Eleventy from "@11ty/eleventy";
import { STATIC } from "../eleventy.config.js";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

// One real production build, shared by the publishing tests below.
const out = mkdtempSync(join(tmpdir(), "netria-site-"));
process.chdir(root);
await new Eleventy(".", out, { quietMode: true, configPath: "eleventy.config.js" }).write();
const built = (path) => existsSync(join(out, path));

test("every local file the homepage references is published", () => {
  const refs = [...read("index.html").matchAll(/(?:src|href|srcset)="([^"#:]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    const path = ref.replace(/^\//, "");
    assert.ok(built(path) || built(join(path, "index.html")), `${ref} is missing from the build`);
  }
  for (const path of ["signal.js", "assets/fonts/fusion-pixel-12px-monospaced-latin.otf.woff2", "CNAME"]) {
    assert.ok(built(path), path);
  }
});

test("internal files and drafts stay out of the published site", () => {
  for (const path of ["README.md", "docs", "tests", "package.json", "eleventy.config.js", "_includes", "node_modules"]) {
    assert.ok(!built(path), `${path} was published`);
    assert.ok(!STATIC.includes(path));
  }
  const drafts = readdirSync(join(root, "articles")).filter((f) => f.endsWith(".md") && /^draft:\s*true/m.test(read(join("articles", f))));
  for (const file of drafts) {
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    assert.ok(!built(join("articles", slug)), `draft ${file} was published`);
    assert.doesNotMatch(readFileSync(join(out, "articles/index.html"), "utf8"), new RegExp(slug));
  }
});

test("articles ship a listing, feed, sitemap and robots file", () => {
  for (const path of ["articles/index.html", "articles/feed.xml", "sitemap.xml", "robots.txt"]) {
    assert.ok(built(path), path);
  }
  assert.match(readFileSync(join(out, "articles/feed.xml"), "utf8"), /^<\?xml/);
  assert.match(readFileSync(join(out, "sitemap.xml"), "utf8"), /^<\?xml/);
  assert.match(read("robots.txt"), /Sitemap: https:\/\/www\.netria\.dev\/sitemap\.xml/);
});

test("article pages scroll normally and carry search and share metadata", () => {
  const base = read("_includes/base.njk");
  const article = read("_includes/article.njk");
  assert.match(base, /src="\/script\.js"/);
  assert.doesNotMatch(base, /scenes\.js/);
  assert.match(base, /rel="canonical"/);
  assert.match(base, /"@type": "BlogPosting"/);
  assert.match(base, /og:type" content="\{\{ 'article' if isArticle/);
  assert.match(article, /isArticle: true/);
  assert.match(article, /mailto:\{\{ site\.email \}\}\?subject=\{\{ \('Re: ' \+ title\) \| urlencode \}\}/);
});

test("only the homepage pager locks native scroll", () => {
  assert.match(read("scenes.js"), /classList\.add\("paged"\)/);
  assert.doesNotMatch(read("styles.css"), /html\.js\b/);
});

test("deploys run the tests before building", () => {
  const workflow = read(".github/workflows/deploy.yml");
  assert.ok(workflow.indexOf("npm test") < workflow.indexOf("npm run build"));
  assert.match(workflow, /path: _site/);
  assert.match(workflow, /actions\/deploy-pages@/);
});
