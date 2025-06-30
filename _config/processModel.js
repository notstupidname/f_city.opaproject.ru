import { promises as fs } from 'fs';
import path from "path";

import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import { KHRMaterialsPBRSpecularGlossiness } from '@gltf-transform/extensions';
import { EXTTextureWebP } from '@gltf-transform/extensions';
import { draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { weld, prune, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';


// --- CONFIGURATION ---
const INPUT_MODEL_PATH = '_models/model.glb'; // CHANGE THIS to your model
const OUTPUT_MODEL_PATH = 'src/models/model.min.glb'; // The output file
// ---

// GLB Optimiziton
async function processModel() {
  console.log(`[PROCESS] Reading model: ${INPUT_MODEL_PATH}`);
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerExtensions([KHRMaterialsPBRSpecularGlossiness])
    .registerExtensions([EXTTextureWebP])
    .registerDependencies({
      'draco3d.encoder': await draco3d.createEncoderModule()
    });

  const document = await io.read(INPUT_MODEL_PATH);
  console.log('[PROCESS] Reading done');

  const root = document.getRoot();

  // Change material roughness (can be done before or after)
  console.log('[PROCESS] Updating materials...');
  for (const material of root.listMaterials()) {
    material.setRoughnessFactor(0.85);
    material.setMetallicFactor(0);
    // Glass
    if (material.getAlphaMode() == 'BLEND') {
      material.setRoughnessFactor(0);
      material.setMetallicFactor(1);
    }
  }
  console.log('[PROCESS] Applying Draco compression...');
  await document.transform(
    weld(),
    prune(),
    draco({
      method: 'edgebreaker',
      // encodeSpeed: 0,
      // decodeSpeed: 0,
    }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512] })
  );

  console.log('[PROCESS] Compression done');


  await io.write(OUTPUT_MODEL_PATH, document);

  const oldSize = (await fs.stat(INPUT_MODEL_PATH)).size / 1024 / 1024;
  const newSize = (await fs.stat(OUTPUT_MODEL_PATH)).size / 1024 / 1024;

  console.log(`[SUCCESS] Saved optimized model to: ${OUTPUT_MODEL_PATH}`);
  console.log(`          Original size: ${oldSize.toFixed(2)} MB`);
  console.log(`          Optimized size: ${newSize.toFixed(2)} MB`);
};

processModel().catch(console.error);