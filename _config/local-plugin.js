import fg from "fast-glob";
import fs from "fs";
import { promises as fsp } from 'fs';
import path from "path";

import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import { KHRMaterialsPBRSpecularGlossiness } from '@gltf-transform/extensions';
import { EXTTextureWebP } from '@gltf-transform/extensions';
import { draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { weld, prune, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';

import config from '../src/_data/config.js';


// --- THE ROBUST FIX for CI/CD ---
// Pre-load the Draco WASM binaries from our copied files once.
// This is faster and guarantees it works on Cloudflare Pages.

// 1. Define paths to the copied files
const dracoDecoderPath = path.join(process.cwd(), 'draco-decoder', 'draco_decoder_gltf.wasm');
const dracoEncoderPath = path.join(process.cwd(), 'draco-decoder', 'draco_encoder.wasm');

// 2. Read the WASM files into memory buffers
const dracoDecoderBuffer = await fsp.readFile(dracoDecoderPath);
const dracoEncoderBuffer = await fsp.readFile(dracoEncoderPath);

// 3. Create the modules by providing the WASM binary directly
const dracoDecoderModule = await draco3d.createDecoderModule({ wasmBinary: dracoDecoderBuffer });
const dracoEncoderModule = await draco3d.createEncoderModule({ wasmBinary: dracoEncoderBuffer });
// ---

export default async function (eleventyConfig) {

  // Check if file exist
  eleventyConfig.addFilter("fileExist", (filePath) => {
    filePath = "src" + filePath;
    return fs.existsSync(filePath);
  });

  /**
   * Transforms a file path to its minified version (e.g., 'style.css' -> 'style.min.css').
   * @param {string} filePath The original file path.
   * @returns {string} The minified file path.
   */
  function getMinifiedPath(filePath) {
    const parsedPath = path.parse(filePath);
    return path.format({
      dir: parsedPath.dir,
      name: `${parsedPath.name}.min`,
      ext: parsedPath.ext,
    });
  }

  // GLB Optimiziton
  eleventyConfig.addAsyncShortcode('processGlb', async function (src) {
    console.log("Starting GLB optimization");
    const io = new NodeIO()
      .registerExtensions([KHRDracoMeshCompression])
      .registerExtensions([KHRMaterialsPBRSpecularGlossiness])
      .registerExtensions([EXTTextureWebP])
      .registerDependencies({
        'draco3d.decoder': dracoDecoderModule,
        'draco3d.encoder': dracoEncoderModule,
      });

    const document = await io.read(src);
    console.log("Successfully read file");

    const root = document.getRoot();

    // Change material roughness (can be done before or after)
    for (const material of root.listMaterials()) {
      material.setRoughnessFactor(0.85);
      material.setMetallicFactor(0);
      // Glass
      if (material.getAlphaMode() == 'BLEND') {
        material.setRoughnessFactor(0);
        material.setMetallicFactor(1);
      }
    }

    await document.transform(
      weld(),
      prune(),
      draco({ method: 'edgebreaker' }),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512] })
    );

    console.log("Transformed with draco");

    const minifiedName = getMinifiedPath(src);

    // Saving file with same name to avoid uploading >25Mb to CF.Pages
    await io.write(src, document);
    console.log("Written document to disk");
  });

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