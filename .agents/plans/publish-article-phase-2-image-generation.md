# Feature: /publish-article Phase 2 - Image Generation Script

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to the existing verify-fal-setup.mjs script patterns for .env.local loading and ES module structure.

## Feature Description

Phase 2 implements the core image generation script that calls fal.ai's GPT-Image-1.5 model to generate consistent 3D-rendered blog images. The script takes a subject description as input, applies a consistent style prefix, generates the image, and downloads it to a specified output path.

## User Story

As a developer using the /publish-article command
I want to generate consistent 3D-rendered images for blog articles
So that the Siphio blog has a cohesive visual identity

## Problem Statement

The /publish-article automation requires AI-generated images for each blog post. Currently there is no image generation capability. We need a reusable Node.js script that:
1. Connects to fal.ai GPT-Image-1.5 API
2. Applies a consistent 3D render style prefix
3. Generates 16:9 images suitable for blog cards
4. Downloads and saves images locally

## Solution Statement

Create `scripts/generate-blog-image.mjs` - a standalone Node.js ES module script that:
1. Loads FAL_KEY from .env.local
2. Accepts subject and output path as CLI arguments
3. Prepends the standard 3D style prefix to the subject
4. Calls fal.ai GPT-Image-1.5 with correct parameters
5. Downloads the generated image to the specified path
6. Provides clear success/error output

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: scripts/, .env.local
**Dependencies**: @fal-ai/client (already installed in Phase 1)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

- `C:\Users\marley\webapp-test\scripts\verify-fal-setup.mjs` (lines 1-51) - Pattern for .env.local loading, ES module structure, __dirname setup
- `C:\Users\marley\webapp-test\.env.local` (line 6) - FAL_KEY location
- `C:\Users\marley\webapp-test\package.json` (line 21) - @fal-ai/client dependency

### New Files to Create

- `C:\Users\marley\webapp-test\scripts\generate-blog-image.mjs` - Main image generation script

### Relevant Documentation - READ BEFORE IMPLEMENTING

- [fal.ai GPT-Image-1.5 API](https://fal.ai/models/fal-ai/gpt-image-1.5/api)
  - Model ID: `fal-ai/gpt-image-1.5`
  - Image sizes: 1024x1024, 1536x1024 (16:9), 1024x1536
  - Quality: low (~$0.01), medium (~$0.05), high (~$0.20)
  - Output formats: jpeg, png, webp

- [fal.ai Client Documentation](https://docs.fal.ai/model-apis/client)
  - Import: `import { fal } from "@fal-ai/client"`
  - Method: `fal.subscribe("model-id", { input: {...} })`
  - Response: `result.data.images[0].url`

### Patterns to Follow

**ES Module Pattern (from verify-fal-setup.mjs):**
```javascript
#!/usr/bin/env node
import { fal } from "@fal-ai/client";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
```

**.env.local Loading Pattern (from verify-fal-setup.mjs lines 17-30):**
```javascript
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
```

**3D Style Prefix (from PRD section 6):**
```
Glossy 3D render, reflective surfaces, clean gradient background,
soft studio lighting, minimal composition, modern tech aesthetic,
no text, no logos, centered subject, professional product shot
```

---

## IMPLEMENTATION PLAN

### Phase 2.1: Create Script Skeleton

Create the basic script structure with imports, .env.local loading, and CLI argument parsing.

**Tasks:**
- Create file with shebang and ES module imports
- Implement .env.local loading (copy from verify-fal-setup.mjs)
- Parse CLI arguments (subject, output path)
- Validate required arguments and FAL_KEY

### Phase 2.2: Implement Image Generation

Implement the fal.ai API call with correct parameters.

**Tasks:**
- Define the style prefix constant
- Build the full prompt (prefix + subject)
- Call fal.subscribe() with GPT-Image-1.5
- Handle the response

### Phase 2.3: Image Download

Download the generated image from fal.ai URL to local filesystem.

**Tasks:**
- Fetch the image from returned URL
- Write binary data to output path
- Report success with file path and size

### Phase 2.4: Error Handling

Add comprehensive error handling for all failure modes.

**Tasks:**
- Missing FAL_KEY error
- Missing CLI arguments error
- API call failures
- Download failures
- File write failures

---

## STEP-BY-STEP TASKS

### 1. CREATE scripts/generate-blog-image.mjs

- **IMPLEMENT**: Full script with all functionality
- **PATTERN**: ES module structure from verify-fal-setup.mjs
- **IMPORTS**: fal, fs, path, url, https/fetch

**Script Structure:**

```javascript
#!/usr/bin/env node
/**
 * Generate blog images using fal.ai GPT-Image-1.5
 * Usage: node scripts/generate-blog-image.mjs "subject description" "./output.png"
 */

import { fal } from "@fal-ai/client";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ES module __dirname equivalent
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
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

// Parse CLI arguments
const [,, subject, outputPath] = process.argv;

// Validate inputs
if (!subject || !outputPath) {
  console.error("Usage: node generate-blog-image.mjs <subject> <output-path>");
  console.error('Example: node generate-blog-image.mjs "robot assistant" "./public/blog-robot.png"');
  process.exit(1);
}

if (!process.env.FAL_KEY) {
  console.error("Error: FAL_KEY not found in environment");
  console.error("Add FAL_KEY to .env.local file");
  process.exit(1);
}

// Main generation function
async function generateImage() {
  const fullPrompt = `${STYLE_PREFIX}, ${subject}`;

  console.log(`Generating image for: "${subject}"`);
  console.log(`Output: ${outputPath}`);

  try {
    // Call fal.ai API
    const result = await fal.subscribe("fal-ai/gpt-image-1.5", {
      input: {
        prompt: fullPrompt,
        image_size: "1536x1024",  // 16:9 aspect ratio
        quality: "medium",        // ~$0.05/image
        num_images: 1,
        output_format: "png"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_QUEUE") {
          console.log(`Queue position: ${update.position || "processing"}`);
        }
      }
    });

    // Get image URL from response
    const imageUrl = result.data.images[0].url;
    console.log(`Image generated: ${imageUrl}`);

    // Download image
    console.log("Downloading image...");
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resolve output path and write file
    const resolvedPath = resolve(outputPath);
    writeFileSync(resolvedPath, buffer);

    const sizeKB = Math.round(buffer.length / 1024);
    console.log(`✓ Image saved: ${resolvedPath} (${sizeKB} KB)`);

  } catch (error) {
    console.error("Error generating image:", error.message);
    process.exit(1);
  }
}

generateImage();
```

- **GOTCHA**: fal.ai response structure is `result.data.images[0].url`, not `result.images[0].url`
- **GOTCHA**: Use fetch() for downloading (built into Node 18+)
- **GOTCHA**: Convert ArrayBuffer to Buffer before writeFileSync
- **VALIDATE**: `node scripts/generate-blog-image.mjs "robot" "./test-output.png"`

---

## TESTING STRATEGY

### Unit Tests

No formal unit tests required for Phase 2 (CLI script). Manual validation sufficient.

### Integration Tests

**Manual validation commands:**

1. **Test with minimal subject:**
```bash
cd C:/Users/marley/webapp-test && node scripts/generate-blog-image.mjs "robot" "./test-robot.png"
```

2. **Test with complex subject:**
```bash
cd C:/Users/marley/webapp-test && node scripts/generate-blog-image.mjs "AI chat assistant with speech bubbles" "./test-chat.png"
```

3. **Test with blog-appropriate path:**
```bash
cd C:/Users/marley/webapp-test && node scripts/generate-blog-image.mjs "financial dashboard with charts" "./public/blog-test.png"
```

### Edge Cases

- Missing FAL_KEY: Should exit with clear error message
- Missing subject argument: Should show usage help
- Missing output path: Should show usage help
- Invalid output directory: Should fail with file write error
- API rate limit: Should surface fal.ai error message
- Network failure: Should fail gracefully with error message

---

## VALIDATION COMMANDS

### Level 1: Script Syntax

```bash
# Verify script parses without errors
cd C:/Users/marley/webapp-test && node --check scripts/generate-blog-image.mjs
```

**Expected**: No output (exit code 0)

### Level 2: Help/Usage

```bash
# Verify usage message when no args
cd C:/Users/marley/webapp-test && node scripts/generate-blog-image.mjs
```

**Expected**: Shows usage help, exits with code 1

### Level 3: Image Generation

```bash
# Generate test image
cd C:/Users/marley/webapp-test && node scripts/generate-blog-image.mjs "glowing cube" "./test-cube.png"
```

**Expected**:
- Shows "Generating image for: glowing cube"
- Shows queue status
- Shows image URL
- Shows "Image saved: ... (XXX KB)"
- Creates test-cube.png file

### Level 4: Verify Output

```bash
# Check file exists and has reasonable size
ls -la C:/Users/marley/webapp-test/test-cube.png
```

**Expected**: File exists, size > 100KB (PNG images are typically 200-500KB)

### Level 5: Lint Check

```bash
cd C:/Users/marley/webapp-test && npm run lint
```

**Expected**: No new errors (may have existing warnings)

### Level 6: Build Check

```bash
cd C:/Users/marley/webapp-test && npm run build
```

**Expected**: Build succeeds (script is in scripts/, not compiled by Next.js)

---

## ACCEPTANCE CRITERIA

- [x] Script created at `scripts/generate-blog-image.mjs`
- [ ] Script loads FAL_KEY from .env.local
- [ ] Script accepts subject and output path as CLI arguments
- [ ] Script shows usage help when arguments missing
- [ ] Script applies consistent 3D style prefix to all prompts
- [ ] Script calls fal.ai GPT-Image-1.5 with correct parameters
- [ ] Script uses 1536x1024 (16:9) image size
- [ ] Script uses medium quality (~$0.05/image)
- [ ] Script downloads and saves image to specified path
- [ ] Script provides clear progress output
- [ ] Script handles errors gracefully with helpful messages
- [ ] Generated images have consistent 3D render style
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

---

## COMPLETION CHECKLIST

- [ ] Created `scripts/generate-blog-image.mjs`
- [ ] Tested with simple subject (e.g., "robot")
- [ ] Tested with complex subject (e.g., "AI assistant with chat bubbles")
- [ ] Verified image downloads successfully
- [ ] Verified image has correct dimensions (1536x1024)
- [ ] Verified image has 3D render style
- [ ] Verified error handling for missing FAL_KEY
- [ ] Verified error handling for missing arguments
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Cleaned up test images

---

## NOTES

### Design Decisions

1. **Medium Quality**: PRD specifies medium quality at ~$0.05/image. This balances cost and quality for blog images.

2. **16:9 Aspect Ratio (1536x1024)**: Matches blog card display dimensions. Images will be shown in cards without cropping.

3. **PNG Format**: Lossless format preserves 3D render quality. File size is acceptable for blog images.

4. **Style Prefix**: Hardcoded style ensures visual consistency across all generated images. Any subject passed will get the same glossy 3D treatment.

5. **No External Dependencies**: Uses built-in Node 18+ fetch() instead of axios/node-fetch. Keeps dependencies minimal.

### Cost Considerations

- Medium quality: ~$0.05 per image
- Testing should use simple prompts to minimize cost
- Consider adding a --dry-run flag in future for testing without API calls

### Next Steps (Phase 3)

After Phase 2 completion:
1. Create preview-template.html for browser preview
2. Style to match blog-page.tsx card appearance
3. Add placeholder markers for dynamic content injection

### Cleanup After Testing

Delete test images after validation:
```bash
rm C:/Users/marley/webapp-test/test-*.png
rm C:/Users/marley/webapp-test/public/blog-test.png
```
