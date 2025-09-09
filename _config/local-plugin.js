import fg from "fast-glob";
import fs from "fs";

import config from '../src/_data/config.js';

export default function (eleventyConfig) {

  // Prefixes given URL with the site's base URL.
  eleventyConfig.addFilter('toAbsoluteUrl', (url) => { return new URL(url, config.baseUrl).href });

  // IncludeByGlob Shortcode
  eleventyConfig.addShortcode("include-glob", function (glob) {
    const files = fg.sync(glob);
    let text = '';
    for (let file of files) {
      try {
        const data = fs.readFileSync(file, 'utf-8');
        text += data;
      } catch (err) {
        console.log(err);
      }
    }
    return text;
  });

  // Check if file exist
  eleventyConfig.addFilter("fileExist", (filePath) => {
    filePath = "src" + filePath;
    // console.log(filePath);
    // console.log(fs.existsSync(filePath));
    return fs.existsSync(filePath);
  });

  // Check if Image exist
  eleventyConfig.addFilter("imageExist", (fileName) => {
    const fullName = "src" + fileName;
    const extensions = [".jpg", ".png"];
    for (const ext of extensions) {
      const filePath = fullName + ext;
      if (fs.existsSync(filePath)) {
        return `${fileName}${ext}`; // Return the existing file with extension
      }
    }
    // console.log(filePath);
    // console.log(fs.existsSync(filePath));
    return null;
  });

  // Print File content directly into HTML. For SVG images and more.
  eleventyConfig.addFilter('printFileContents', function (filePath) {
    const relativeFilePath = filePath; //`.` + filePath;
    const fileContents = fs.readFileSync(relativeFilePath, (err, data) => {
      if (err) throw err;
      return data;
    });

    return fileContents.toString('utf8');
  });

  // Config for post excerpts
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    // Optional, default is "---"
    excerpt_separator: "<!-- excerpt -->"
  });

  // Filter for pretty localized dates
  eleventyConfig.addFilter('dateLocal', date => {
    const options = {
      dateStyle: 'long',
      // timeStyle: 'full',
      // day: 'numeric',
      // month: 'long',
      // year: '2-digit',
      // minute: '2-digit',
      // second: '2-digit',
    };
    return Intl.DateTimeFormat("ru", options).format(date);
  });

  // Filter for dates for <time> tag
  eleventyConfig.addFilter('dateHTML', date => {
    const options = {
      //dateStyle: 'short',
      // timeStyle: 'full',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      // minute: '2-digit',
      // second: '2-digit',
    };
    return Intl.DateTimeFormat("en-CA", options).format(date);
  });

}
