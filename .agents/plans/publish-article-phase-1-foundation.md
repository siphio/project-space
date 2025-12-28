# Feature: /publish-article Phase 1 - Foundation

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Phase 1 sets up the infrastructure and dependencies required for the `/publish-article` automation. This includes creating the scripts directory structure, installing the fal.ai client package for image generation, configuring the FAL_KEY environment variable, and documenting the SIPHIO_BLOG_REPO setup.

## User Story

As a developer working on Siphio projects
I want the foundational dependencies and environment configured
So that I can proceed to implement the image generation script in Phase 2

## Problem Statement

The `/publish-article` automation requires fal.ai for AI image generation, but the project currently has no fal.ai integration, no scripts directory, and no environment variable configuration for the FAL_KEY.

## Solution Statement

Create a `scripts/` directory in webapp-test, add `@fal-ai/client` as an npm dependency, configure the `FAL_KEY` environment variable in `.env.local`, and document the `SIPHIO_BLOG_REPO` environment variable setup in a README within the scripts folder.

## Feature Metadata

**Feature Type**: New Capability (Infrastructure Setup)
**Estimated Complexity**: Low
**Primary Systems Affected**: package.json, .env.local, scripts/
**Dependencies**: @fal-ai/client npm package, fal.ai API account

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

- `C:\Users\marley\webapp-test\package.json` (lines 1-39) - Current dependencies structure, add @fal-ai/client here
- `C:\Users\marley\webapp-test\.env.local` - Existing env vars (OPENROUTER_API_KEY, OPENROUTER_MODEL), add FAL_KEY here
- `C:\Users\marley\webapp-test\.gitignore` - Confirms `.env*` pattern is already ignored
- `C:\Users\marley\webapp-test\src\data\blog.ts` (lines 1-15) - BlogPost interface structure for reference
- `C:\Users\marley\webapp-test\CLAUDE.md` (Section 8) - Development commands and patterns

### New Files to Create

- `C:\Users\marley\webapp-test\scripts\README.md` - Documentation for scripts directory and environment setup

### Relevant Documentation - READ BEFORE IMPLEMENTING

- [@fal-ai/client npm](https://www.npmjs.com/package/@fal-ai/client)
  - Installation: `npm install --save @fal-ai/client`
  - Current version: 1.8.1 (MIT license)

- [fal.ai Client Documentation](https://docs.fal.ai/model-apis/client)
  - Environment variable: `FAL_KEY` auto-detected by library
  - Basic usage with fal.subscribe() method

- [GPT-Image-1.5 API](https://fal.ai/models/fal-ai/gpt-image-1.5)
  - Model ID: `fal-ai/gpt-image-1.5`
  - Image sizes: 1024x1024, 1536x1024, 1024x1536
  - Quality: low (~$0.01), medium (~$0.05), high (~$0.20)
  - Output formats: png, jpeg, webp

- [fal.ai API Keys](https://fal.ai/dashboard/keys)
  - Where to generate FAL_KEY

### Patterns to Follow

**Package.json Dependencies Pattern:**
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.71.2",
    "@fal-ai/client": "^1.8.1"  // ADD HERE - alphabetical order
  }
}
```

**Environment Variable Pattern (.env.local):**
```bash
# Existing pattern - API keys stored here
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=x-ai/grok-4.1-fast

# New - follow same pattern
FAL_KEY=your_fal_api_key_here
```

**README Documentation Pattern:**
Based on CLAUDE.md structure - use tables, code blocks, clear headings.

---

## IMPLEMENTATION PLAN

### Phase 1.1: Create Scripts Directory

Create the `scripts/` directory at the project root with a README documenting its purpose and the required environment variable setup.

**Tasks:**
- Create `scripts/` directory
- Create `scripts/README.md` with setup documentation

### Phase 1.2: Install fal.ai Client

Add the `@fal-ai/client` package as a production dependency.

**Tasks:**
- Run `npm install --save @fal-ai/client`
- Verify package added to package.json
- Verify package-lock.json updated

### Phase 1.3: Configure Environment Variable

Add `FAL_KEY` placeholder to `.env.local` with documentation comment.

**Tasks:**
- Add FAL_KEY to .env.local
- Document that user must replace with actual key

### Phase 1.4: Validation

Verify all components are properly configured.

**Tasks:**
- Verify npm install succeeds
- Verify FAL_KEY is accessible in Node.js runtime
- Verify .gitignore excludes .env.local

---

## STEP-BY-STEP TASKS

### 1. CREATE scripts/README.md

- **IMPLEMENT**: Create README with environment setup documentation
- **PATTERN**: Follow CLAUDE.md documentation style (tables, headers, code blocks)
- **CONTENT**:

```markdown
# Siphio Scripts

Automation scripts for the Siphio AI project.

## Environment Setup

The following environment variables are required for scripts in this directory:

| Variable | Location | Required | Purpose |
|----------|----------|----------|---------|
| `FAL_KEY` | `.env.local` | Yes | fal.ai API authentication for image generation |
| `SIPHIO_BLOG_REPO` | Shell profile | Yes | Absolute path to webapp-test repo (for cross-repo publishing) |

### FAL_KEY Setup

1. Go to [fal.ai Dashboard](https://fal.ai/dashboard/keys)
2. Create a new API key
3. Add to `.env.local`:
   ```bash
   FAL_KEY=your_fal_api_key_here
   ```

### SIPHIO_BLOG_REPO Setup

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or Windows Environment Variables):

**macOS/Linux:**
```bash
export SIPHIO_BLOG_REPO="/path/to/webapp-test"
```

**Windows (PowerShell):**
```powershell
[Environment]::SetEnvironmentVariable("SIPHIO_BLOG_REPO", "C:\Users\marley\webapp-test", "User")
```

**Windows (Command Prompt - Persistent):**
```cmd
setx SIPHIO_BLOG_REPO "C:\Users\marley\webapp-test"
```

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `generate-blog-image.mjs` | Generate 3D render images via fal.ai | `node scripts/generate-blog-image.mjs "subject" "./output.png"` |
| `preview-template.html` | Browser preview template for articles | Opened automatically by /publish-article |

## Dependencies

- `@fal-ai/client` - fal.ai JavaScript client (installed in package.json)
```

- **VALIDATE**: `ls C:/Users/marley/webapp-test/scripts/README.md`

---

### 2. UPDATE package.json - Add @fal-ai/client dependency

- **IMPLEMENT**: Run npm install to add the fal.ai client
- **IMPORTS**: None (npm handles this)
- **GOTCHA**: Use `--save` flag to add to dependencies (not devDependencies)
- **VALIDATE**: `npm list @fal-ai/client`

**Command:**
```bash
cd C:/Users/marley/webapp-test && npm install --save @fal-ai/client
```

**Expected package.json change:**
```json
"dependencies": {
  "@anthropic-ai/sdk": "^0.71.2",
  "@fal-ai/client": "^1.8.1",   // NEW - auto-sorted alphabetically
  "@radix-ui/react-accordion": "^1.2.12",
  ...
}
```

---

### 3. UPDATE .env.local - Add FAL_KEY

- **IMPLEMENT**: Add FAL_KEY placeholder with documentation comment
- **PATTERN**: Match existing OPENROUTER_API_KEY format
- **GOTCHA**: Do NOT commit actual API key - use placeholder
- **VALIDATE**: `grep FAL_KEY C:/Users/marley/webapp-test/.env.local`

**Add to .env.local:**
```bash
# fal.ai API key for image generation
# Get your key at: https://fal.ai/dashboard/keys
FAL_KEY=your_fal_api_key_here
```

---

### 4. VERIFY .gitignore includes .env.local

- **IMPLEMENT**: Confirm .env.local is gitignored (should already be)
- **PATTERN**: Check for `.env*` pattern
- **VALIDATE**: `grep -E "\.env" C:/Users/marley/webapp-test/.gitignore`

**Expected output should include:**
```
.env*
```

If missing, add:
```
.env.local
```

---

### 5. CREATE verification script (temporary)

- **IMPLEMENT**: Create a temporary test script to verify fal.ai client loads
- **PATTERN**: ES modules (.mjs extension)
- **GOTCHA**: Requires FAL_KEY to be set for actual API calls
- **VALIDATE**: `node scripts/verify-fal-setup.mjs`

**Create scripts/verify-fal-setup.mjs:**
```javascript
#!/usr/bin/env node
/**
 * Temporary verification script for Phase 1
 * Tests that @fal-ai/client is properly installed
 * Delete after verification
 */

import { fal } from "@fal-ai/client";

console.log("✓ @fal-ai/client imported successfully");

// Check if FAL_KEY is configured
const hasKey = !!process.env.FAL_KEY && process.env.FAL_KEY !== "your_fal_api_key_here";
if (hasKey) {
  console.log("✓ FAL_KEY environment variable is configured");
} else {
  console.log("⚠ FAL_KEY not configured (set in .env.local before using image generation)");
}

// Check SIPHIO_BLOG_REPO
const repoPath = process.env.SIPHIO_BLOG_REPO;
if (repoPath) {
  console.log(`✓ SIPHIO_BLOG_REPO is set to: ${repoPath}`);
} else {
  console.log("⚠ SIPHIO_BLOG_REPO not set (needed for cross-repo publishing)");
}

console.log("\n✓ Phase 1 Foundation setup complete!");
console.log("  - @fal-ai/client: installed");
console.log("  - scripts/ directory: created");
console.log("  - Next: Configure FAL_KEY with your actual API key");
console.log("  - Then: Proceed to Phase 2 (Image Generation Script)");
```

**Run with:**
```bash
cd C:/Users/marley/webapp-test && node scripts/verify-fal-setup.mjs
```

---

## TESTING STRATEGY

### Unit Tests

No unit tests required for Phase 1 (infrastructure setup only).

### Integration Tests

**Manual verification that:**
1. `npm install` completes without errors
2. `@fal-ai/client` appears in package.json dependencies
3. `node scripts/verify-fal-setup.mjs` runs without import errors
4. FAL_KEY placeholder exists in .env.local

### Edge Cases

- **Missing Node.js**: Script requires Node.js 18+ (ES modules support)
- **npm cache issues**: Run `npm cache clean --force` if install fails
- **Windows path issues**: Use forward slashes in npm commands

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Package Installation

```bash
# Verify @fal-ai/client is installed
cd C:/Users/marley/webapp-test && npm list @fal-ai/client
```

**Expected**: Shows `@fal-ai/client@1.x.x` in output

### Level 2: Environment Configuration

```bash
# Verify FAL_KEY exists in .env.local
grep FAL_KEY C:/Users/marley/webapp-test/.env.local
```

**Expected**: Line containing `FAL_KEY=`

### Level 3: Import Verification

```bash
# Verify fal.ai client can be imported
cd C:/Users/marley/webapp-test && node scripts/verify-fal-setup.mjs
```

**Expected**: "✓ @fal-ai/client imported successfully"

### Level 4: Build Verification

```bash
# Ensure no breaking changes to Next.js build
cd C:/Users/marley/webapp-test && npm run build
```

**Expected**: Build completes successfully

### Level 5: Lint Check

```bash
# Ensure no linting errors introduced
cd C:/Users/marley/webapp-test && npm run lint
```

**Expected**: Exit code 0

---

## ACCEPTANCE CRITERIA

- [x] `scripts/` directory created at project root
- [x] `scripts/README.md` documents environment setup
- [x] `@fal-ai/client` added to package.json dependencies
- [x] `FAL_KEY` placeholder added to .env.local
- [x] .gitignore excludes .env.local (pre-existing)
- [x] Verification script confirms fal.ai client imports successfully
- [x] `npm run build` still passes
- [x] `npm run lint` passes

---

## COMPLETION CHECKLIST

- [ ] Created `scripts/` directory
- [ ] Created `scripts/README.md` with setup documentation
- [ ] Ran `npm install --save @fal-ai/client`
- [ ] Verified `@fal-ai/client` in package.json
- [ ] Added `FAL_KEY` to `.env.local`
- [ ] Verified `.env.local` is gitignored
- [ ] Created `scripts/verify-fal-setup.mjs`
- [ ] Ran verification script successfully
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

---

## NOTES

### Design Decisions

1. **ES Modules (.mjs)**: Using `.mjs` extension for scripts to enable ES module imports without package.json type changes. This maintains compatibility with the existing CommonJS setup while allowing modern import syntax.

2. **Placeholder API Key**: Using `your_fal_api_key_here` as placeholder rather than empty string. This makes it obvious when the key hasn't been configured and prevents silent failures.

3. **Verification Script**: Including a temporary verification script helps validate the setup before proceeding to Phase 2. Can be deleted after Phase 4 completion.

### Cost Considerations

fal.ai GPT-Image-1.5 pricing per image:
- Low quality: ~$0.01
- Medium quality: ~$0.05 (recommended for blog posts)
- High quality: ~$0.20

PRD specifies medium quality at ~$0.05/image for balance of quality and cost.

### Next Steps (Phase 2)

After Phase 1 completion:
1. Implement `scripts/generate-blog-image.mjs` with fal.ai integration
2. Add consistent 3D render style prefix
3. Download and save images to specified path
4. Handle errors gracefully

### References

- [fal.ai Dashboard](https://fal.ai/dashboard/keys) - Get API key
- [fal.ai Client Docs](https://docs.fal.ai/model-apis/client) - Usage guide
- [GPT-Image-1.5 API](https://fal.ai/models/fal-ai/gpt-image-1.5) - Model parameters
- [PRD-publish-article.md](.agents/PRD-publish-article.md) - Full requirements
