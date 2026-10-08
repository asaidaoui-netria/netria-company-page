// Eleventy builds the articles; the homepage and its assets are copied through untouched.
// Only what is listed here or rendered from articles/ reaches the published site.
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { modelExplorer } from "./_includes/model-explorer.js";

export const STATIC = ["index.html", "styles.css", "script.js", "scenes.js", "signal.js", "explorer.js", "assets", "CNAME", "robots.txt"];

// GitHub Pages lets browsers reuse these for 10 minutes; content-versioned URLs keep a deploy
// from pairing new HTML with an old cached stylesheet or script.
export const VERSIONED = ["styles.css", "script.js", "scenes.js", "signal.js", "explorer.js"];
export const version = async (file) => createHash("sha256").update(await readFile(file)).digest("hex").slice(0, 10);

const SITE = { url: "https://www.netria.dev", name: "Netria", email: "hello@netria.dev" };

export default function (eleventyConfig) {
    STATIC.forEach((path) => eleventyConfig.addPassthroughCopy(path));
    ["README.md", "docs/**", "tests/**"].forEach((glob) => eleventyConfig.ignores.add(glob));

    eleventyConfig.addGlobalData("site", SITE);
    // Preview: reload the page on changes instead of patching it in place, which would undo
    // what scripts like explorer.js set up after load.
    eleventyConfig.setServerOptions({ domDiff: false });
    // Curly quotes and apostrophes: Space Grotesk draws a straight " like a closing quote.
    eleventyConfig.amendLibrary("md", (md) => md.set({ typographer: true }));
    // {% modelExplorer data %} in an article with `templateEngineOverride: njk,md`.
    eleventyConfig.addShortcode("modelExplorer", modelExplorer);

    eleventyConfig.on("eleventy.after", async ({ directories, runMode }) => {
        if (runMode !== "build") {
            return;
        }
        const v = Object.fromEntries(await Promise.all(VERSIONED.map(async (f) => [f, await version(f)])));
        const pattern = new RegExp(`(src|href)="(/?)(${VERSIONED.join("|").replaceAll(".", "\\.")})"`, "g");
        for (const file of await readdir(directories.output, { recursive: true })) {
            if (file.endsWith(".html")) {
                const path = join(directories.output, file);
                const html = await readFile(path, "utf8");
                await writeFile(path, html.replace(pattern, (_, attr, slash, name) => `${attr}="${slash}${name}?v=${v[name]}"`));
            }
        }
    });
    eleventyConfig.addCollection("articles", (api) => api.getFilteredByGlob("articles/*.md").reverse());

    // `draft: true` shows in `npm start` but never in the published build.
    eleventyConfig.addPreprocessor("drafts", "md", (data) => {
        if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
            return false;
        }
    });

    eleventyConfig.addFilter("isoDate", (date) => date.toISOString());
    eleventyConfig.addFilter("readableDate", (date) =>
        date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    );
    // Reference widgets such as the model explorer are browsed, not read: leave them out.
    eleventyConfig.addFilter("readingTime", (html) =>
        Math.max(
            1,
            Math.round(
                html
                    .replace(/<div class="mx"[\s\S]*?<!--\/mx-->/g, " ")
                    .replace(/<[^>]+>/g, " ")
                    .split(/\s+/)
                    .filter(Boolean).length / 220
            )
        )
    );
}

export const config = {
    templateFormats: ["md", "njk"],
    // Articles are prose: `{{` in a post is text, not a template tag.
    markdownTemplateEngine: false,
};
