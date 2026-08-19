import markdownIt from "markdown-it";

const md = markdownIt({ html: true, typographer: true });

export default function (eleventyConfig) {
  // Match the shortcode's markdown instance, so curly quotes and dashes are
  // consistent across pages rendered by Eleventy and by the chapter shortcode.
  eleventyConfig.amendLibrary("md", (lib) => lib.set({ typographer: true }));

  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

  // A chapter on the Experience page: date range in the margin column,
  // heading and prose in the main text column. Prose stays markdown.
  eleventyConfig.addPairedShortcode("chapter", (content, dates, heading) => {
    return `<section class="row chapter" data-reveal>
  <p class="row__margin meta">${dates}</p>
  <div class="row__main prose">
    <h2 class="chapter__heading">${heading}</h2>
    ${md.render(content.trim())}
  </div>
</section>`;
  });

  eleventyConfig.addCollection("projects", (api) =>
    api
      .getFilteredByTag("projects")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
  );

  eleventyConfig.addFilter("year", () => String(new Date().getFullYear()));

  eleventyConfig.addFilter("isoDate", (date) =>
    new Date(date).toISOString().slice(0, 10)
  );

  eleventyConfig.addFilter("readableDate", (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
