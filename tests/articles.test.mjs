import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Eleventy from "@11ty/eleventy";
import { STATIC, VERSIONED, version } from "../eleventy.config.js";
import { modelExplorer } from "../_includes/model-explorer.js";

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

test("built pages reference stylesheets and scripts by content version", async () => {
  for (const page of ["index.html", "articles/index.html"]) {
    const html = readFileSync(join(out, page), "utf8");
    for (const file of VERSIONED) {
      const refs = [...html.matchAll(new RegExp(`(?:src|href)="/?${file.replace(".", "\\.")}([^"]*)"`, "g"))];
      for (const [, query] of refs) {
        assert.equal(query, `?v=${await version(file)}`, `${page} → ${file}`);
      }
    }
    assert.match(html, /styles\.css\?v=/, page);
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

test("the decision figure animates only when motion is allowed", () => {
  const css = read("styles.css");
  const start = css.indexOf("@media (prefers-reduced-motion: no-preference)");
  const end = css.indexOf("@keyframes df-", start);
  const uses = [...css.matchAll(/animation:[^;]*\bdf-/g)].map((m) => m.index);
  assert.ok(start > -1 && uses.length > 0);
  for (const at of uses) {
    assert.ok(at > start && at < end, "a df- animation runs outside the motion-allowed block");
  }
});

test("the model explorer renders accessible tabs from its data", () => {
  const { decisionModels: data } = JSON.parse(read("articles/2026-10-08-decision-models.11tydata.json"));
  const html = modelExplorer(data);
  assert.doesNotMatch(html, /\n\s*\n/, "a blank line would end Markdown's HTML block");
  const tabs = [...html.matchAll(/role="tab"[^>]*aria-controls="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(tabs.length, data.models.length + 1);
  for (const id of tabs) {
    assert.match(html, new RegExp(`<section[^>]*id="${id}"[^>]*role="tabpanel"`));
  }
  assert.match(html, /may already be out of date/);
  assert.match(html, new RegExp(new Date(`${data.asOf}T00:00:00Z`).getUTCFullYear()));
  for (const m of data.models) {
    assert.ok(m.sources.length && m.sources.every((s) => s.url.startsWith("https://")), m.id);
    if (m.logo) {
      assert.ok(existsSync(join(root, m.logo)), `${m.id} logo ${m.logo} is missing`);
    }
  }
  assert.ok(STATIC.includes("explorer.js") && VERSIONED.includes("explorer.js"));
});

test("search and answer engines get structured, consistent signals", () => {
  const home = read("index.html");
  const ld = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const org = ld["@graph"].find((n) => n["@type"] === "Organization");
  assert.equal(org.url, "https://www.netria.dev/");
  assert.ok(existsSync(join(root, new URL(org.logo).pathname)), "organization logo is missing");
  assert.ok(ld["@graph"].some((n) => n["@type"] === "WebSite"));

  const base = read("_includes/base.njk");
  for (const page of [home, base]) {
    assert.match(page, /rel="preload" href="\/?assets\/fonts\/fusion-pixel[^"]+\.woff2" as="font" type="font\/woff2" crossorigin/);
  }
  assert.match(base, /"dateModified"/);
  assert.match(base, /"publisher": \{[\s\S]*"logo"/);
  assert.match(base, /\{% if author %\}\{ "@type": "Person"/);

  const llms = readFileSync(join(out, "llms.txt"), "utf8");
  assert.match(llms, /^# Netria\n/);
  assert.match(llms, /https:\/\/www\.netria\.dev\/articles\//);
  assert.doesNotMatch(llms, /Article template/, "drafts must not reach llms.txt");

  // Every published article ships valid structured data that names its author.
  const posts = readdirSync(join(out, "articles"), { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const post of posts) {
    const html = readFileSync(join(out, "articles", post.name, "index.html"), "utf8");
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(data["@type"], "BlogPosting", post.name);
    assert.ok(data.author["@id"] || data.author.name, `${post.name} has no author`);
    assert.match(llms, new RegExp(`/articles/${post.name}/`), `${post.name} missing from llms.txt`);
  }
});

test("only the homepage pager locks native scroll", () => {
  assert.match(read("scenes.js"), /classList\.add\("paged"\)/);
  assert.doesNotMatch(read("styles.css"), /html\.js\b/);
  const live = (html) => html.replace(/<!--[\s\S]*?-->/g, "").replace(/\{#[\s\S]*?#\}/g, "");
  assert.match(live(read("index.html")), /<a href="\/articles\/">Articles<\/a>/);
  assert.match(live(read("_includes/base.njk")), /<a href="\/articles\/"/);
});

test("deploys run the tests before building", () => {
  const workflow = read(".github/workflows/deploy.yml");
  assert.ok(workflow.indexOf("npm test") < workflow.indexOf("npm run build"));
  assert.match(workflow, /path: _site/);
  assert.match(workflow, /actions\/deploy-pages@/);
});
