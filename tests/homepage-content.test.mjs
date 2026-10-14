import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
    /Netria designs and builds custom digital products and automated systems that turn complex work into forward motion\./
  );
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.netria\.dev\/">/);
  // The bare domain redirects to www: every absolute URL should already point at www.
  assert.doesNotMatch(html, /https:\/\/netria\.dev/);
  assert.doesNotMatch(
    html,
    /Morocco|Moroccan|Maroc|المغرب|Kenitra|Kénitra/i
  );
});

test("says what Netria builds and how a project runs", () => {
  const ids = [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ["top", "capabilities", "approach", "principles", "contact"]);
  const eyebrows = [...html.matchAll(/<p class="eyebrow"><span>(\d\d)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(eyebrows, ["01", "02", "03", "04", "05"]);

  assert.match(authoredText, /Software for ideas and operations in motion\./);
  assert.match(html, /<\/h1>\s*<p class="hero-summary">[^<]{40,}<\/p>/);
  assert.match(html, /Build a product/);
  assert.match(html, /Improve a system/);

  const approach = html.slice(html.indexOf('id="approach"'), html.indexOf('id="principles"'));
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

test("ships no analytics or custom localization", () => {
  assert.doesNotMatch(html, /plausible|analytics|data-domain|langDrawer|language-selector/i);
  assert.doesNotMatch(html, /i18n\.js|data-i18n|hreflang/i);
  assert.equal(existsSync(join(root, "i18n.js")), false);
});

test("avoids unsupported proof claims", () => {
  assert.doesNotMatch(
    html,
    /trusted by|client logos?|testimonials?|100%|projects delivered|years of experience/i
  );
});

test("provides one navigation landmark and accessible menu hooks", () => {
  assert.equal((html.match(/<nav\b/g) ?? []).length, 1);
  assert.match(html, /id="navToggle"/);
  assert.match(html, /aria-controls="navMenu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /id="navMenu"/);
});

test("the page is one scrolling document with a page footer", () => {
  assert.doesNotMatch(html, /scenes\.js|scroll-cue|scene--active/);
  assert.match(html, /<\/main>\s*<footer class="footer">/);
  assert.match(html, /© 2026 Netria\. All rights reserved\./);
});

test("every email action opens a short brief, and the address can be copied", () => {
  const mailtos = [...html.matchAll(/href="(mailto:[^"]+)"/g)].map((m) => m[1]);
  assert.equal(mailtos.length, 3);
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
  assert.match(html, /<button type="button" class="copy-email" data-copy="hello@netria\.dev">Copy address<\/button>/);
});

test("names the person a visitor will work with", () => {
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const founder = main.slice(main.indexOf('id="founder"'));
  assert.match(founder, /<p class="founder-name">[^<]+<span>[^<]+<\/span><\/p>\s*<p>[^<]{60,}<\/p>/);
  assert.ok(main.indexOf('id="founder"') > main.indexOf('id="contact"'), "founder sits in the contact section");
  assert.doesNotMatch(main, /forward motion|«/);

  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const org = ld["@graph"].find((node) => node["@type"] === "Organization");
  assert.equal(org.founder["@type"], "Person");
  assert.equal(org.founder["@id"], "https://www.netria.dev/#founder");
  assert.equal(org.founder.name, "Abderrahman SaidAlaoui");
});
