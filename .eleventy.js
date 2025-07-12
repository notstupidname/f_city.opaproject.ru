import { transform } from "lightningcss";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import faviconsPlugin from "eleventy-plugin-gen-favicons";
import sitemap from "@quasibit/eleventy-plugin-sitemap";
import { minify } from "terser";
import htmlmin from "html-minifier-terser";
import { EleventyRenderPlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import path from "path";
import markdownIt from "markdown-it";

import localPlugin from "./_config/local-plugin.js";
import config from "./src/_data/config.js";

export default function (eleventyConfig) {

  // Directories config
  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setOutputDirectory("_site");

  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/icons");

  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/models");
  eleventyConfig.addPassthroughCopy("src/files");
  eleventyConfig.addPassthroughCopy("src/assets/js/model-viewer.min.js");

  // Watch for all files in src/asssets/
  eleventyConfig.addWatchTarget("src/assets/**/*.*");

  // PLUGINS

  // Local plugin
  eleventyConfig.addPlugin(localPlugin);

  // Favicons plugin
  eleventyConfig.addPlugin(faviconsPlugin, { 'generateManifest': false });

  //Render Template Plugin for Favicons plugin parameters
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  // Sitemap plugin
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: config.baseUrl,
      changefreq: "weekly",
      priority: 1.0,
    },
  });

  // Navigation plugin
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Image Plugin
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // which file extensions to process
    extensions: "html",

    // Add any other Image utility options here:
    formats: ["webp", "jpeg"],
    widths: config.imageSizes,

    sharpJpegOptions: {
      mozjpeg: true
    },
    outputDir: "./_site/img/",

    // optional, attributes assigned on <img> override these values.
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "100vw"
    },
  });


  // FILTERS

  // Custom markdown filter
  const md = new markdownIt();
  eleventyConfig.addFilter("markdown", (content) => {
    return md.render(content);
  });

  // CSS Minifier using Lightningcss
  eleventyConfig.addFilter("cssmin", function (code) {
    let { code: minifiedCode } = transform({
      code: Buffer.from(code),
      minify: true,
      sourceMap: false
    });
    return minifiedCode.toString();
  });

  // JS Minifier
  eleventyConfig.addAsyncFilter("jsmin", async function (code) {
    try {
      const minified = await minify(code);
      return minified.code;
    } catch (err) {
      console.error("Terser error: ", err);
      // Fail gracefully.
      return code;
    }
  });

  // HTML Minifier
  eleventyConfig.addTransform("htmlmin", function (content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        preserveLineBreaks: true,
        minifyJS: true
      });
      return minified;
    }
    return content;
  });


};