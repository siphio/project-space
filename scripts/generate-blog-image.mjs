#!/usr/bin/env node
/**
 * Generate or edit blog images using fal.ai
 *
 * GENERATE MODE (default - adds 3D style prefix):
 *   node scripts/generate-blog-image.mjs "subject description" "./output.png"
 *
 * RAW MODE (use prompt as-is, for brand-compliant prompts):
 *   node scripts/generate-blog-image.mjs --raw "full prompt with styling" "./output.png"
 *
 * EDIT MODE:
 *   node scripts/generate-blog-image.mjs --edit "edit instructions" "./input.png" "./output.png"
 */

import { fal } from "@fal-ai/client";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ES module __dirname equivalent
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (Next.js does this automatically, but standalone scripts don't)
const envPath = resolve(__dirname, "..", ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join("=");
      }
    }
  }
} catch {
  // .env.local might not exist
}

// 3D style prefix for consistent blog imagery
const STYLE_PREFIX = `Glossy 3D render, reflective surfaces, clean gradient background, soft studio lighting, minimal composition, modern tech aesthetic, no text, no logos, centered subject, professional product shot`;

// Check for mode flags
const isEditMode = process.argv[2] === "--edit";
const isRawMode = process.argv[2] === "--raw";

// Parse CLI arguments based on mode
let prompt, inputPath, outputPath;

if (isEditMode) {
  // Edit mode: --edit "instructions" "./input.png" "./output.png"
  [, , , prompt, inputPath, outputPath] = process.argv;

  if (!prompt || !inputPath || !outputPath) {
    console.error("Edit mode usage:");
    console.error(
      '  node generate-blog-image.mjs --edit "remove all text" "./input.png" "./output.png"'
    );
    process.exit(1);
  }

  if (!existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }
} else if (isRawMode) {
  // Raw mode: --raw "full prompt" "./output.png"
  [, , , prompt, outputPath] = process.argv;

  if (!prompt || !outputPath) {
    console.error("Raw mode usage (for brand-compliant prompts):");
    console.error(
      '  node generate-blog-image.mjs --raw "full styled prompt" "./public/blog-image.png"'
    );
    process.exit(1);
  }
} else {
  // Generate mode: "subject" "./output.png"
  [, , prompt, outputPath] = process.argv;

  if (!prompt || !outputPath) {
    console.error("Generate mode usage:");
    console.error(
      '  node generate-blog-image.mjs "robot assistant" "./public/blog-robot.png"'
    );
    console.error("");
    console.error("Raw mode usage (for brand-compliant prompts):");
    console.error(
      '  node generate-blog-image.mjs --raw "full styled prompt" "./output.png"'
    );
    console.error("");
    console.error("Edit mode usage:");
    console.error(
      '  node generate-blog-image.mjs --edit "remove all text" "./input.png" "./output.png"'
    );
    process.exit(1);
  }
}

if (!process.env.FAL_KEY) {
  console.error("Error: FAL_KEY not found in environment");
  console.error("Add FAL_KEY to .env.local file");
  process.exit(1);
}

/**
 * Convert a local file to a data URI for fal.ai
 */
function fileToDataUri(filePath) {
  const resolvedPath = resolve(filePath);
  const buffer = readFileSync(resolvedPath);
  const base64 = buffer.toString("base64");

  // Determine mime type from extension
  const ext = filePath.toLowerCase().split(".").pop();
  const mimeTypes = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };
  const mimeType = mimeTypes[ext] || "image/png";

  return `data:${mimeType};base64,${base64}`;
}

/**
 * Download image from URL and save to file
 */
async function downloadAndSave(imageUrl, savePath) {
  console.log("Downloading image...");
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const resolvedPath = resolve(savePath);
  writeFileSync(resolvedPath, buffer);

  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`✓ Image saved: ${resolvedPath} (${sizeKB} KB)`);
}

/**
 * Generate a new image from text prompt
 */
async function generateImage() {
  // In raw mode, use prompt as-is; otherwise add 3D style prefix
  const fullPrompt = isRawMode ? prompt : `${STYLE_PREFIX}, ${prompt}`;

  console.log(`Mode: ${isRawMode ? "raw (brand-compliant)" : "styled (3D render)"}`);
  console.log(`Generating image...`);
  console.log(`Output: ${outputPath}`);

  try {
    const result = await fal.subscribe("fal-ai/gpt-image-1.5", {
      input: {
        prompt: fullPrompt,
        image_size: "1536x1024", // 16:9 aspect ratio
        quality: "medium",
        num_images: 1,
        output_format: "png",
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_QUEUE") {
          console.log(`Queue position: ${update.position || "processing"}`);
        }
      },
    });

    const imageUrl = result.data.images[0].url;
    console.log(`Image generated: ${imageUrl}`);

    await downloadAndSave(imageUrl, outputPath);
  } catch (error) {
    console.error("Error generating image:", error.message);
    process.exit(1);
  }
}

/**
 * Edit an existing image using fal-ai/nano-banana-pro/edit
 */
async function editImage() {
  console.log(`Editing image: "${inputPath}"`);
  console.log(`Instructions: "${prompt}"`);
  console.log(`Output: ${outputPath}`);

  try {
    // Convert input image to data URI
    const imageDataUri = fileToDataUri(inputPath);

    const result = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
      input: {
        image_urls: [imageDataUri],
        prompt: prompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_QUEUE") {
          console.log(`Queue position: ${update.position || "processing"}`);
        }
      },
    });

    // Get the output image URL
    const imageUrl = result.data.images?.[0]?.url || result.data.image?.url;
    if (!imageUrl) {
      console.error("API Response:", JSON.stringify(result.data, null, 2));
      throw new Error("No image URL in response");
    }

    console.log(`Image edited: ${imageUrl}`);
    await downloadAndSave(imageUrl, outputPath);
  } catch (error) {
    console.error("Error editing image:", error.message);
    if (error.body) {
      console.error("API Error:", JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

// Run the appropriate function
if (isEditMode) {
  editImage();
} else {
  generateImage();
}
