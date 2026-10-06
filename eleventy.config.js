// Eleventy builds the articles; the homepage and its assets are copied through untouched.
// Only what is listed here or rendered from articles/ reaches the published site.
export const STATIC = ["index.html", "styles.css", "script.js", "scenes.js", "signal.js", "assets", "CNAME", "robots.txt"];

const SITE = { url: "https://www.netria.dev", name: "Netria", email: "hello@netria.dev" };

export default function (eleventyConfig) {
    STATIC.forEach((path) => eleventyConfig.addPassthroughCopy(path));
    ["README.md", "docs/**", "tests/**"].forEach((glob) => eleventyConfig.ignores.add(glob));

    eleventyConfig.addGlobalData("site", SITE);
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
    eleventyConfig.addFilter("readingTime", (html) =>
        Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 220))
    );
}

export const config = {
    templateFormats: ["md", "njk"],
    // Articles are prose: `{{` in a post is text, not a template tag.
    markdownTemplateEngine: false,
};
