# Siphio Scripts

Automation scripts for the Siphio AI project.

## Environment Setup

| Variable | Location | Required | Purpose |
|----------|----------|----------|---------|
| `FAL_KEY` | `.env.local` | Yes | fal.ai API authentication for image generation |

### FAL_KEY Setup

1. Go to [fal.ai Dashboard](https://fal.ai/dashboard/keys)
2. Create a new API key
3. Add to `.env.local`:
   ```bash
   FAL_KEY=your_fal_api_key_here
   ```

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `generate-blog-image.mjs` | Generate 3D render images via fal.ai | `node scripts/generate-blog-image.mjs "subject" "./output.png"` |
| `preview-template.html` | Browser preview template for articles | Opened automatically by /publish-article |

## Dependencies

- `@fal-ai/client` - fal.ai JavaScript client (installed in package.json)
