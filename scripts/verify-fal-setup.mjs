#!/usr/bin/env node
/**
 * Temporary verification script for Phase 1
 * Tests that @fal-ai/client is properly installed
 * Delete after verification
 */

import { fal } from "@fal-ai/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local manually (Next.js does this automatically, but standalone scripts don't)
const __dirname = dirname(fileURLToPath(import.meta.url));
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

console.log("✓ @fal-ai/client imported successfully");

// Check if FAL_KEY is configured
const hasKey = !!process.env.FAL_KEY && process.env.FAL_KEY !== "your_fal_api_key_here";
if (hasKey) {
  console.log("✓ FAL_KEY environment variable is configured");
} else {
  console.log("⚠ FAL_KEY not configured (set in .env.local before using image generation)");
}

// Check repo path (auto-detected from script location)
const repoPath = resolve(__dirname, "..");
console.log(`✓ Repository path: ${repoPath}`);

console.log("\n✓ Phase 1 Foundation setup complete!");
console.log("  - @fal-ai/client: installed");
console.log("  - scripts/ directory: created");
console.log("  - Next: Configure FAL_KEY with your actual API key");
console.log("  - Then: Proceed to Phase 2 (Image Generation Script)");
