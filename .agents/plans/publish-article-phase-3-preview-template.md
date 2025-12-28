# Feature: /publish-article Phase 3 - Preview Template

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to matching the exact styling from blog-page.tsx and blog-post.tsx. The preview must visually match the actual website.

## Feature Description

Phase 3 creates an HTML preview template that displays a blog article exactly as it will appear on the Siphio website. The template shows both the blog card view (as seen on /blog) and the full article content, allowing the developer to review the generated content before publishing. The template includes placeholder markers that will be replaced with actual content by the /publish-article command.

## User Story

As a developer using the /publish-article command
I want to preview the blog article exactly as it will appear on the website
So that I can verify the content, image, and styling before publishing

## Problem Statement

The /publish-article automation needs a browser-based preview step before publishing. Currently there is no way to preview generated articles. We need an HTML template that:
1. Matches the exact styling of the Siphio blog (blog-page.tsx, blog-post.tsx)
2. Shows the blog card view with image, category badge, title, and excerpt
3. Shows the full article content with proper markdown rendering
4. Uses placeholder markers for dynamic content injection
5. Works as a standalone HTML file (no build step required)

## Solution Statement

Create `scripts/preview-template.html` - a self-contained HTML file that:
1. Uses Tailwind CSS via CDN for styling (matching webapp-test)
2. Replicates the card structure from blog-page.tsx (lines 104-165)
3. Replicates the article content structure from blog-post.tsx (lines 134-177)
4. Uses `{{PLACEHOLDER}}` markers for: title, slug, excerpt, content, category, image_path, date
5. Includes category badge colors matching categoryColors in blog-page.tsx (lines 38-44)
6. Opens in browser for visual validation before publishing

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: scripts/
**Dependencies**: Tailwind CSS CDN (no npm packages required)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

- `C:\Users\marley\webapp-test\src\components\blocks\blog-page.tsx` (lines 38-44) - Category badge colors (blue, green, purple, orange, indigo)
- `C:\Users\marley\webapp-test\src\components\blocks\blog-page.tsx` (lines 104-165) - Blog card structure with image, badge, title, excerpt
- `C:\Users\marley\webapp-test\src\components\blocks\blog-post.tsx` (lines 16-42) - Category config with colors and icons
- `C:\Users\marley\webapp-test\src\components\blocks\blog-post.tsx` (lines 134-177) - Article content rendering with markdown support
- `C:\Users\marley\webapp-test\src\data\blog.ts` (lines 1-15) - BlogPost interface structure
- `C:\Users\marley\webapp-test\scripts\generate-blog-image.mjs` - Existing script pattern for reference

### New Files to Create

- `C:\Users\marley\webapp-test\scripts\preview-template.html` - Browser preview template

### Relevant Documentation

- [Tailwind CSS Play CDN](https://tailwindcss.com/docs/installation/play-cdn)
  - Script tag: `<script src="https://cdn.tailwindcss.com"></script>`
  - Why: Provides styling matching webapp-test without build step

- [Tailwind aspect-ratio plugin](https://tailwindcss.com/docs/aspect-ratio)
  - Class: `aspect-video` or `aspect-[16/9]`
  - Why: Blog cards use 16:9 aspect ratio images

### Patterns to Follow

**Category Badge Colors (from blog-page.tsx lines 38-44):**
```javascript
const categoryColors = {
  company: "bg-blue-500/10 text-blue-700",
  hiring: "bg-green-500/10 text-green-700",
  product: "bg-purple-500/10 text-purple-700",
  announcement: "bg-orange-500/10 text-orange-700",
  engineering: "bg-indigo-500/10 text-indigo-700",
};
```

**Blog Card Structure (from blog-page.tsx lines 106-164):**
```html
<div class="card overflow-hidden rounded-lg border">
  <div class="aspect-[16/9] w-full">
    <img src="..." alt="..." class="h-full w-full object-cover" />
  </div>
  <div class="p-4">
    <div class="flex items-center gap-2 mb-2">
      <span class="badge">category</span>
      <span class="text-sm text-gray-500">date</span>
    </div>
    <h3 class="text-lg font-semibold">title</h3>
  </div>
  <div class="p-4 pt-0">
    <p class="text-gray-600">excerpt</p>
  </div>
</div>
```

**Article Content Rendering (from blog-post.tsx lines 137-176):**
- `## Header` → `<h2 class="text-2xl font-bold mt-8 mb-4">`
- `### Subheader` → `<h3 class="text-xl font-semibold mt-6 mb-3">`
- `- List item` → `<ul class="list-disc list-inside">`
- Regular text → `<p class="text-gray-600 leading-relaxed mb-4">`

**Placeholder Markers:**
```
{{TITLE}}        - Article title
{{SLUG}}         - URL slug
{{EXCERPT}}      - Short description
{{CONTENT}}      - Full article content (markdown)
{{CATEGORY}}     - company|hiring|product|announcement|engineering
{{IMAGE_PATH}}   - Path to generated image (e.g., /public/blog-slug.png)
{{DATE}}         - Publication date (e.g., December 28, 2024)
{{AUTHOR}}       - Author name
```

---

## IMPLEMENTATION PLAN

### Phase 3.1: Create HTML Structure

Create the basic HTML document with Tailwind CDN and responsive layout.

**Tasks:**
- HTML5 document structure with meta tags
- Tailwind CSS CDN script
- Custom styles for category colors
- Two-section layout: card preview + article content

### Phase 3.2: Implement Blog Card Preview

Replicate the blog card from blog-page.tsx with placeholder markers.

**Tasks:**
- Card container with rounded corners and shadow
- 16:9 aspect ratio image container
- Category badge with dynamic color classes
- Title and date display
- Excerpt text

### Phase 3.3: Implement Article Content Preview

Replicate the full article view from blog-post.tsx.

**Tasks:**
- Article header with category, title, excerpt
- Author and date metadata
- Featured image display
- Content area with markdown rendering note

### Phase 3.4: Add Preview Controls

Add visual elements to indicate this is a preview.

**Tasks:**
- "Preview" banner at top
- Visual separator between card and content
- Instructions for approval actions

---

## STEP-BY-STEP TASKS

### 1. CREATE scripts/preview-template.html

- **IMPLEMENT**: Complete HTML template with all sections
- **PATTERN**: Match blog-page.tsx card structure and blog-post.tsx content structure
- **GOTCHA**: Use Tailwind CDN `<script src="https://cdn.tailwindcss.com"></script>` in head
- **GOTCHA**: Category color classes need custom CSS since Tailwind purges unused classes
- **VALIDATE**: Open in browser, verify layout matches website

**Full Template:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Article Preview - {{TITLE}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Category badge colors matching blog-page.tsx */
    .badge-company { background-color: rgb(59 130 246 / 0.1); color: rgb(29 78 216); }
    .badge-hiring { background-color: rgb(34 197 94 / 0.1); color: rgb(21 128 61); }
    .badge-product { background-color: rgb(168 85 247 / 0.1); color: rgb(126 34 206); }
    .badge-announcement { background-color: rgb(249 115 22 / 0.1); color: rgb(194 65 12); }
    .badge-engineering { background-color: rgb(99 102 241 / 0.1); color: rgb(67 56 202); }

    /* Markdown content styling */
    .prose h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; }
    .prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; }
    .prose p { color: rgb(107 114 128); line-height: 1.75; margin-bottom: 1rem; }
    .prose ul { list-style-type: disc; list-style-position: inside; margin: 1rem 0; }
    .prose li { color: rgb(107 114 128); margin-bottom: 0.5rem; }
    .prose strong { color: rgb(17 24 39); font-weight: 600; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- Preview Banner -->
  <div class="bg-orange-500 text-white py-3 px-4 text-center font-medium">
    <span class="text-lg">Preview Mode</span>
    <span class="mx-2">|</span>
    <span>Review this article before publishing</span>
  </div>

  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Section: Blog Card Preview -->
    <div class="mb-12">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Blog Card Preview (as seen on /blog)
      </h2>

      <div class="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-md">
        <!-- Image -->
        <div class="aspect-[16/9] w-full bg-gradient-to-br from-orange-100 to-yellow-50">
          <img
            src="{{IMAGE_PATH}}"
            alt="{{TITLE}}"
            class="h-full w-full object-cover"
            onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\'h-full w-full flex items-center justify-center text-orange-300 text-6xl font-bold\'>{{TITLE_INITIAL}}</div>';"
          />
        </div>

        <!-- Card Header -->
        <div class="p-4 pb-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge-{{CATEGORY}} px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
              {{CATEGORY}}
            </span>
            <span class="text-sm text-gray-500">{{DATE}}</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 hover:underline">
            {{TITLE}}
          </h3>
        </div>

        <!-- Card Content -->
        <div class="px-4 pb-4">
          <p class="text-gray-600 text-sm">{{EXCERPT}}</p>
        </div>

        <!-- Card Footer -->
        <div class="px-4 pb-4">
          <span class="text-gray-900 text-sm font-medium flex items-center gap-1">
            Read more
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 my-8"></div>

    <!-- Section: Full Article Preview -->
    <div>
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Full Article Preview (as seen on /blog/{{SLUG}})
      </h2>

      <article class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <!-- Article Header -->
        <div class="p-8 pb-6 border-b border-gray-100">
          <div class="mb-4">
            <span class="badge-{{CATEGORY}} px-3 py-1 rounded-full text-sm font-medium capitalize inline-flex items-center gap-1.5">
              {{CATEGORY}}
            </span>
          </div>

          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            {{TITLE}}
          </h1>

          <p class="text-xl text-gray-600 mb-6">
            {{EXCERPT}}
          </p>

          <div class="flex items-center gap-6 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <span class="font-medium text-gray-900">{{AUTHOR}}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{DATE}}
            </div>
          </div>
        </div>

        <!-- Featured Image -->
        <div class="p-8 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div class="rounded-xl overflow-hidden max-w-2xl mx-auto">
            <img
              src="{{IMAGE_PATH}}"
              alt="{{TITLE}}"
              class="w-full h-auto"
              onerror="this.parentElement.parentElement.style.display='none';"
            />
          </div>
        </div>

        <!-- Article Content -->
        <div class="p-8 prose max-w-none">
          {{CONTENT_HTML}}
        </div>
      </article>
    </div>

    <!-- Approval Instructions -->
    <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 class="font-semibold text-blue-900 mb-2">Ready to Publish?</h3>
      <p class="text-blue-700 text-sm">
        Return to the terminal and type <code class="bg-blue-100 px-1.5 py-0.5 rounded">yes</code> to publish,
        <code class="bg-blue-100 px-1.5 py-0.5 rounded">edit</code> to modify, or
        <code class="bg-blue-100 px-1.5 py-0.5 rounded">cancel</code> to abort.
      </p>
    </div>

    <!-- Metadata Summary -->
    <div class="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
      <h4 class="font-semibold text-gray-700 mb-2">Article Metadata</h4>
      <div class="grid grid-cols-2 gap-2">
        <div><span class="font-medium">Slug:</span> {{SLUG}}</div>
        <div><span class="font-medium">Category:</span> {{CATEGORY}}</div>
        <div><span class="font-medium">Author:</span> {{AUTHOR}}</div>
        <div><span class="font-medium">Date:</span> {{DATE}}</div>
        <div class="col-span-2"><span class="font-medium">Image:</span> {{IMAGE_PATH}}</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="border-t border-gray-200 mt-12 py-6 text-center text-gray-500 text-sm">
    Siphio AI Blog Preview | Generated by /publish-article
  </div>
</body>
</html>
```

- **GOTCHA**: Image onerror fallback shows first letter of title if image fails to load
- **GOTCHA**: `{{CONTENT_HTML}}` is pre-rendered markdown (the slash command will convert markdown to HTML)
- **GOTCHA**: `{{TITLE_INITIAL}}` is the first character of the title for fallback display
- **VALIDATE**: `start C:/Users/marley/webapp-test/scripts/preview-template.html` (Windows)

---

## TESTING STRATEGY

### Unit Tests

No formal unit tests required for Phase 3 (static HTML template). Manual validation sufficient.

### Integration Tests

**Manual validation steps:**

1. **Open template directly in browser:**
```bash
# Windows
start C:/Users/marley/webapp-test/scripts/preview-template.html
```

2. **Verify placeholder markers are visible:**
- `{{TITLE}}` appears in page title, card, and article
- `{{CATEGORY}}` appears with badge styling
- `{{EXCERPT}}` and `{{CONTENT_HTML}}` placeholders visible

3. **Test with sample content (manual placeholder replacement):**
Create a test file with placeholders replaced to verify styling.

### Edge Cases

- **Missing image**: Template should gracefully show fallback (first letter of title)
- **Long title**: Should wrap properly without breaking layout
- **Long excerpt**: Should display fully without truncation in preview
- **All category types**: Each category should have correct badge color

---

## VALIDATION COMMANDS

### Level 1: File Exists

```bash
ls C:/Users/marley/webapp-test/scripts/preview-template.html
```

**Expected**: File exists

### Level 2: HTML Syntax Check

```bash
# Check for basic HTML structure
grep -c "<!DOCTYPE html>" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "</html>" C:/Users/marley/webapp-test/scripts/preview-template.html
```

**Expected**: Both return `1`

### Level 3: Placeholder Markers Present

```bash
# Verify all required placeholders exist
grep -c "{{TITLE}}" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "{{CATEGORY}}" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "{{EXCERPT}}" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "{{CONTENT_HTML}}" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "{{IMAGE_PATH}}" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "{{DATE}}" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "{{SLUG}}" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "{{AUTHOR}}" C:/Users/marley/webapp-test/scripts/preview-template.html
```

**Expected**: All return `1` or more

### Level 4: Tailwind CDN Present

```bash
grep -c "cdn.tailwindcss.com" C:/Users/marley/webapp-test/scripts/preview-template.html
```

**Expected**: Returns `1`

### Level 5: Category Colors Present

```bash
grep -c "badge-company" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "badge-hiring" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "badge-product" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "badge-announcement" C:/Users/marley/webapp-test/scripts/preview-template.html
grep -c "badge-engineering" C:/Users/marley/webapp-test/scripts/preview-template.html
```

**Expected**: All return `1` or more

### Level 6: Visual Validation

```bash
# Open in default browser (Windows)
start C:/Users/marley/webapp-test/scripts/preview-template.html
```

**Expected**:
- Page loads without errors
- Orange preview banner visible at top
- Blog card section visible with placeholder markers
- Full article section visible below
- Approval instructions visible at bottom

### Level 7: Lint Check

```bash
cd C:/Users/marley/webapp-test && npm run lint
```

**Expected**: No new errors (HTML files not linted by ESLint)

### Level 8: Build Check

```bash
cd C:/Users/marley/webapp-test && npm run build
```

**Expected**: Build succeeds (HTML in scripts/ not compiled by Next.js)

---

## ACCEPTANCE CRITERIA

- [ ] Template created at `scripts/preview-template.html`
- [ ] Uses Tailwind CSS CDN for styling
- [ ] Blog card section matches blog-page.tsx styling
- [ ] Full article section matches blog-post.tsx styling
- [ ] All placeholder markers present: TITLE, SLUG, EXCERPT, CONTENT_HTML, CATEGORY, IMAGE_PATH, DATE, AUTHOR, TITLE_INITIAL
- [ ] Category badge colors match blog-page.tsx (blue, green, purple, orange, indigo)
- [ ] Image fallback displays first letter of title when image fails
- [ ] Preview banner clearly indicates preview mode
- [ ] Approval instructions visible at bottom
- [ ] Metadata summary shows all article details
- [ ] Opens in browser without errors
- [ ] `npm run lint` passes (no new errors)
- [ ] `npm run build` passes

---

## COMPLETION CHECKLIST

- [ ] Created `scripts/preview-template.html`
- [ ] Verified Tailwind CDN loads correctly
- [ ] Verified all placeholder markers present
- [ ] Verified category badge colors work for all 5 categories
- [ ] Tested image fallback behavior
- [ ] Opened template in browser to verify layout
- [ ] Compared styling to actual blog-page.tsx
- [ ] Compared styling to actual blog-post.tsx
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

---

## NOTES

### Design Decisions

1. **Tailwind CDN**: Using CDN instead of building Tailwind locally. This keeps the preview template self-contained and doesn't require a build step. The CDN version includes all Tailwind classes.

2. **Custom CSS for Badges**: Category badge colors are defined in custom CSS because the Tailwind CDN doesn't know about dynamic class names like `badge-{{CATEGORY}}`. This ensures colors work when placeholders are replaced.

3. **Two Preview Sections**: Showing both card view and full article helps developers see exactly how content appears in both contexts (blog listing page and individual article page).

4. **Placeholder Format**: Using `{{PLACEHOLDER}}` format (double curly braces) for easy regex replacement and avoiding conflicts with HTML/JS syntax.

5. **Image Fallback**: Using `onerror` handler to gracefully handle missing images. Shows first letter of title in orange gradient background, matching the existing fallback in blog-page.tsx.

6. **CONTENT_HTML Placeholder**: The slash command will pre-render markdown to HTML before injecting. This avoids needing a JS markdown parser in the template.

### Placeholder Reference

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{TITLE}}` | Article title | "AI-Powered Workout Tracking" |
| `{{SLUG}}` | URL slug | "ai-powered-workout-tracking" |
| `{{EXCERPT}}` | 1-2 sentence hook | "Track your workouts with AI..." |
| `{{CONTENT_HTML}}` | Pre-rendered HTML from markdown | `<p>Full article...</p>` |
| `{{CATEGORY}}` | One of 5 category values | "product" |
| `{{IMAGE_PATH}}` | Path to image file | "/public/blog-ai-workout.png" |
| `{{DATE}}` | Formatted publication date | "December 28, 2024" |
| `{{AUTHOR}}` | Author name | "Siphio Team" |
| `{{TITLE_INITIAL}}` | First letter of title | "A" |

### Next Steps (Phase 4)

After Phase 3 completion:
1. Create the `/publish-article` slash command
2. Implement context gathering from git/plans
3. Implement content generation via Claude
4. Implement preview generation with placeholder replacement
5. Implement approval flow
6. Implement blog.ts update logic
7. Implement git commit/push flow

### Color Reference

| Category | Background | Text |
|----------|------------|------|
| company | blue-500/10 | blue-700 |
| hiring | green-500/10 | green-700 |
| product | purple-500/10 | purple-700 |
| announcement | orange-500/10 | orange-700 |
| engineering | indigo-500/10 | indigo-700 |

These exact values are extracted from blog-page.tsx lines 38-44.
