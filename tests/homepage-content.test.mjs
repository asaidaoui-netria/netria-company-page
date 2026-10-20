import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const authoredText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("uses internationally neutral English metadata", () => {
  assert.match(html, /<html lang="en" class="no-js">/);
  assert.match(html, /<title>Netria — Custom Software &amp; Workflow Automation<\/title>/);
  assert.match(
    html,
    /Netria builds web apps, internal tools and automations for teams whose work has outgrown spreadsheets and off-the-shelf software\./
  );
  // Search snippets, share cards and structured data all use the new line.
  assert.doesNotMatch(html, /forward motion/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.netria\.dev\/">/);
  // The bare domain redirects to www: every absolute URL should already point at www.
  assert.doesNotMatch(html, /https:\/\/netria\.dev/);
  // Location stays out of the pitch; only the footer's legal line names the registry.
  assert.doesNotMatch(
    html.replace(/<footer[\s\S]*<\/footer>/, ""),
    /Morocco|Moroccan|Maroc|المغرب|Kenitra|Kénitra/i
  );
});

test("says what Netria builds and how a project runs", () => {
  const ids = [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ["top", "capabilities", "approach", "contact"]);
  const eyebrows = [...html.matchAll(/<p class="eyebrow"><span>(\d\d)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(eyebrows, ["01", "02", "03", "04"]);

  assert.match(authoredText, /Software for ideas and operations in motion\./);
  assert.match(html, /<\/h1>\s*<p class="hero-summary">[^<]{40,}<\/p>/);
  assert.match(html, /Build a product/);
  assert.match(html, /Improve a system/);

  const approach = html.slice(html.indexOf('id="approach"'), html.indexOf('id="contact"'));
  const steps = [...approach.matchAll(/<li>\s*<span>0\d<\/span>\s*<div>\s*<h3>([^<]+)<\/h3>\s*<p>[^<]{30,}<\/p>/g)];
  assert.deepEqual(steps.map((m) => m[1]), ["Frame the problem", "Prototype the path", "Build and validate", "Release and hand over"]);
  assert.doesNotMatch(html, /«/, "an owner input was left unfilled");
});

test("uses direct email contact with no contact form", () => {
  assert.ok(
    (html.match(/mailto:hello@netria\.dev/g) ?? []).length >= 2,
    "expected at least two direct email actions"
  );
  assert.ok(
    (html.match(/hello@netria\.dev/g) ?? []).length >= 3,
    "expected a visible, copyable email fallback"
  );
  assert.doesNotMatch(html, /<form\b|Formspree|formspree\.io|contactForm/i);
});

test("loads no third-party script but the Cloudflare visit counter, with one site token", () => {
  const base = readFileSync(join(root, "_includes/base.njk"), "utf8");
  const beacon = /<script type="module" src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js" data-cf-beacon='\{"token": "[0-9a-f]{32}"\}'><\/script>/;
  for (const page of [html, base]) {
    const external = [...page.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]).filter((src) => /^(https?:)?\/\//.test(src));
    assert.deepEqual(external, ["https://static.cloudflareinsights.com/beacon.min.js"]);
    assert.match(page, beacon);
  }
  assert.equal(html.match(beacon)[0], base.match(beacon)[0]);
});

test("ships no custom localization", () => {
  assert.doesNotMatch(html, /langDrawer|language-selector/i);
  assert.doesNotMatch(html, /i18n\.js|data-i18n|hreflang/i);
  assert.equal(existsSync(join(root, "i18n.js")), false);
});

test("avoids unsupported proof claims", () => {
  assert.doesNotMatch(
    html,
    /trusted by|client logos?|testimonials?|100%|projects delivered|years of experience/i
  );
});

test("labels each navigation landmark and provides accessible menu hooks", () => {
  const labels = [...html.matchAll(/<nav\b[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(labels, ["Primary navigation", "Footer"]);
  assert.equal((html.match(/<nav\b/g) ?? []).length, labels.length);
  assert.match(html, /id="navToggle"/);
  assert.match(html, /aria-controls="navMenu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /id="navMenu"/);
});

test("the page is one scrolling document with a page footer", () => {
  assert.doesNotMatch(html, /scenes\.js|scroll-cue|scene--active/);
  assert.match(html, /<\/main>\s*<footer class="footer">/);
  assert.match(html, /© 2026 Netria SARLAU/);
});

test("every email action opens a short brief, and the address can be copied", () => {
  const mailtos = [...html.matchAll(/href="(mailto:[^"]+)"/g)].map((m) => m[1]);
  assert.equal(mailtos.length, 4);
  for (const href of mailtos) {
    // %20 and %0D%0A, never "+": some mail apps show a literal plus.
    assert.doesNotMatch(href, /\+/);
    const url = new URL(href.replaceAll("&amp;", "&"));
    assert.equal(url.pathname, "hello@netria.dev");
    assert.equal(url.searchParams.get("subject"), "Project conversation");
    assert.equal(
      url.searchParams.get("body"),
      "What do you want to build or fix?\r\n\r\n\r\nWhen do you need it?\r\n\r\n\r\nRough budget, if you have one:\r\n"
    );
  }
  assert.match(html, /<span id="contact-address">hello@netria\.dev<\/span>/);
  // aria-label keeps the name fixed while the "Copied" tag shows.
  assert.match(html, /<button type="button" class="copy-email" data-copy="contact-address" aria-label="Copy address">Copy address<\/button>/);
});

test("names the person a visitor will work with", () => {
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const founder = main.slice(main.indexOf('id="founder"'));
  assert.match(founder, /<img class="founder-photo" src="assets\/founder\.webp" alt="" width="128" height="128">\s*<p class="founder-name">[^<]+<span>[^<]+<\/span><\/p>\s*<p class="founder-bio">[^<]{60,}<\/p>/);
  assert.ok(statSync(join(root, "assets/founder.webp")).size < 20_000, "photo stays small");
  assert.ok(main.indexOf('id="founder"') > main.indexOf('id="contact"'), "founder sits in the contact section");
  assert.doesNotMatch(main, /forward motion|«/);

  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const org = ld["@graph"].find((node) => node["@type"] === "Organization");
  assert.equal(org.founder["@type"], "Person");
  assert.equal(org.founder["@id"], "https://www.netria.dev/#founder");
  assert.equal(org.founder.name, "Abderrahman Said-Alaoui");
  assert.match(founder, /<p class="founder-name">Abderrahman Said-Alaoui<span>/);

  const linkedin = "https://www.linkedin.com/in/asaidalaoui/";
  assert.ok(founder.includes(`<a class="founder-link" href="${linkedin}">LinkedIn <span aria-hidden="true">↗</span></a>`));
  assert.deepEqual(org.founder.sameAs, [linkedin]);
  assert.equal(org.founder.image, "https://www.netria.dev/assets/founder.webp");
});


test("links from the July pager to #situations and #systems still land on the capabilities", () => {
  const caps = html.slice(html.indexOf('id="capabilities"'), html.indexOf('id="approach"'));
  assert.match(caps, /<div class="capability-grid" id="situations">/);
  assert.match(caps, /<article class="capability-card" id="systems">/);
});

test("the principles section is gone, and its old links land on the process", () => {
  assert.doesNotMatch(html, /principle-grid|Working principles/);
  assert.match(html, /<ol class="approach-list" id="principles">/);
});

test("the header links straight to the process and the founder", () => {
  const nav = html.slice(html.indexOf('id="navMenu"'), html.indexOf("</nav>"));
  assert.match(nav, /<a href="#approach">How we work<\/a>\s*<a href="#founder">About<\/a>\s*<a href="\/articles\/">Articles<\/a>/);
});

test("the footer names the registered company and links to the legal page", () => {
  const footer = html.match(/<footer class="footer">([\s\S]*?)<\/footer>/)[1];
  assert.match(footer, /<p class="footer-legal">© 2026 Netria SARLAU · RC Kénitra 78945 · ICE 003776887000054<\/p>/);
  assert.match(footer, /<nav class="footer-nav" aria-label="Footer">/);
  for (const href of ["#approach", "#founder", "/articles/", "https://www.linkedin.com/in/asaidalaoui/", "/legal/"]) {
    assert.ok(footer.includes(`href="${href}"`), href);
  }
});
