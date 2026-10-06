// Every article: the article layout, published at /articles/<filename without its date>/.
export default {
    layout: "article.njk",
    permalink: (data) => `/articles/${data.page.fileSlug}/`,
};
