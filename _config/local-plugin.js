import fg from "fast-glob";
import fs from "fs";
import path from "path";

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

  // 11-ty Image Plugin Shortcode FROM URL
  // eleventyConfig.addShortcode("respImageURL", async function (src, alt, sizes = "100vw", loading = "lazy") {
  //   if (alt === undefined) {
  //       // You bet we throw an error on missing alt (alt="" works okay)
  //       throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
  //   }

  //   const imageSrc = `src/${src}`;
  //   const imageDir = `${path.dirname(src)}`;

  //   let metadata;

  //   try {
  //       metadata = await Image(src, {
  //           widths: [300, 600, 1100, 1500, 1800, 2000, 2400],
  //           formats: ['webp', 'jpeg'],
  //           outputDir: `./_site/img/`,
  //           sharpJpegOptions: {
  //               mozjpeg: true
  //           }
  //       });
  //   } catch (e) {
  //       // console.log(e);
  //       return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  //       <circle fill="blue" stroke="none" cx="500" cy="500" r="375"/>
  //   </svg>`;
  //   }


  //   let lowsrc = metadata.jpeg[0];
  //   let highsrc = metadata.jpeg[metadata.jpeg.length - 1];
  //   let loadingAttr = loading === 'lazy' ? 'loading="lazy"' : 'fetchpriority="high"';

  //   return `<picture>
  //       ${Object.values(metadata).map(imageFormat => {
  //       return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
  //   }).join("\n")}
  //           <img
  //               src="${lowsrc.url}"
  //               width="${highsrc.width}"
  //               height="${highsrc.height}"
  //               alt="${alt}"
  //               ${loadingAttr}
  //               decoding="async">
  //       </picture>`;
  // });

}