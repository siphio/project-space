# Feature: /publish-article Phase 4 - Slash Command with Iterative Edit Loop

The following plan should be complete, but validate documentation and codebase patterns before implementing.

This is the final phase that creates the global `/publish-article` slash command, tying together all infrastructure from Phases 1-3.

## Feature Description

Phase 4 creates `~/.claude/commands/publish-article.md` - a global Claude Code slash command that automates blog article creation and publishing. The command gathers context from the current repository, generates article content and images, presents a browser preview, and allows iterative editing until the user approves. Upon approval, it updates blog.ts, commits changes, and optionally pushes to deploy.

**Key Feature: Iterative Edit Loop** - After initial generation, users can refine title, excerpt, content, category, and regenerate images through natural conversation until satisfied.

## User Story

As a developer working on any Siphio project
I want to run `/publish-article "description"` and iteratively refine the article
So that I can publish professional blog posts without switching repos or manual editing

## Problem Statement

Publishing blog articles requires multiple manual steps: writing content, creating images, formatting for the blog, and committing changes. This friction means features often ship without accompanying announcements.

## Solution Statement

Create a conversational slash command that:
1. Generates initial article content and image from context
2. Shows browser preview matching actual blog styling
3. Allows iterative edits through natural language ("change title to X", "regenerate image with Y")
4. Only publishes after explicit approval
5. Handles all git operations automatically

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: ~/.claude/commands/, webapp-test/scripts/, webapp-test/src/data/blog.ts
**Dependencies**: Phases 1-3 complete (generate-blog-image.mjs, preview-template.html, @fal-ai/client)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

- `C:\Users\marley\webapp-test\scripts\generate-blog-image.mjs` - Image generation script to call
- `C:\Users\marley\webapp-test\scripts\preview-template.html` - Preview template with {{PLACEHOLDERS}}
- `C:\Users\marley\webapp-test\src\data\blog.ts` (lines 1-15) - BlogPost interface structure
- `C:\Users\marley\webapp-test\src\data\blog.ts` (lines 17-47) - Example blog post format
- `C:\Users\marley\webapp-test\.agents\PRD-publish-article.md` - Full requirements document

### New Files to Create

- `~/.claude/commands/publish-article.md` - Global slash command (personal, not project)

### Relevant Documentation

- [Claude Code Slash Commands](https://docs.anthropic.com/claude-code/slash-commands)
  - Custom command format with frontmatter
  - $ARGUMENTS for user input
  - !`command` for inline bash output

### Patterns to Follow

**Slash Command Frontmatter:**
```markdown
---
description: Publish blog article with AI-generated content and image
allowed-tools: Bash(node:*), Bash(git:*), Bash(start:*), Bash(open:*), Read, Write, Edit
---
```

**BlogPost Interface (from blog.ts):**
```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "company" | "hiring" | "product" | "announcement" | "engineering";
  image?: string;
  author: { name: string; avatar?: string; };
  publishedAt: string;
  featured?: boolean;
}
```

**Preview Template Placeholders:**
```
{{TITLE}}        - Article title
{{SLUG}}         - URL slug (kebab-case)
{{EXCERPT}}      - 1-2 sentence description
{{CONTENT_HTML}} - Markdown converted to HTML
{{CATEGORY}}     - company|hiring|product|announcement|engineering
{{IMAGE_PATH}}   - Relative path to image
{{DATE}}         - Formatted date (December 28, 2024)
{{AUTHOR}}       - Author name (default: "Siphio Team")
{{TITLE_INITIAL}}- First character of title (for fallback)
```

**Image Generation Command:**
```bash
node C:/Users/marley/webapp-test/scripts/generate-blog-image.mjs "subject" "C:/Users/marley/webapp-test/public/blog-{slug}.png"
```

**Category Detection Rules:**
- `product` - New features, app updates, releases
- `engineering` - Technical deep-dives, architecture decisions
- `announcement` - Company news, milestones, launches
- `company` - Team updates, culture, general news
- `hiring` - Job postings (manual only)

---

## IMPLEMENTATION PLAN

### Phase 4.1: Create Command Directory

Create the ~/.claude/commands/ directory if it doesn't exist.

**Tasks:**
- Create directory structure
- Verify permissions

### Phase 4.2: Write Slash Command

Create the publish-article.md command file with full workflow logic.

**Tasks:**
- Frontmatter with description and allowed-tools
- Context gathering instructions
- Content generation prompts
- Image generation integration
- Preview generation and browser opening
- Iterative edit loop logic
- Blog.ts update instructions
- Git commit/push workflow

### Phase 4.3: Validation

Test the command end-to-end from a different repo.

**Tasks:**
- Verify command appears in /help
- Test context gathering
- Test preview generation
- Test edit loop
- Test publishing

---

## STEP-BY-STEP TASKS

### 1. CREATE ~/.claude/commands/ directory

- **IMPLEMENT**: Create the global commands directory
- **VALIDATE**: `ls ~/.claude/commands/`

```bash
mkdir -p ~/.claude/commands
```

---

### 2. CREATE ~/.claude/commands/publish-article.md

- **IMPLEMENT**: Full slash command with iterative edit loop
- **PATTERN**: Claude Code slash command format with frontmatter
- **GOTCHA**: Use absolute paths for SIPHIO_BLOG_REPO since command runs from any directory
- **GOTCHA**: Windows paths need forward slashes in bash commands
- **VALIDATE**: Run `/publish-article test` and verify it starts

**Full Command Content:**

```markdown
---
description: Publish blog article to Siphio with AI-generated content and 3D image
allowed-tools: Bash(node:*), Bash(git:*), Bash(start:*), Bash(open:*), Bash(cat:*), Bash(ls:*), Bash(mkdir:*), Bash(cp:*), Read, Write, Edit, Glob, Grep
---

# /publish-article - Blog Publishing Automation

You are helping publish a blog article to the Siphio AI website. This is an iterative process where you'll generate content, show a preview, and refine until the user approves.

## Configuration

**Target Blog Repository:** `C:/Users/marley/webapp-test`
**Scripts Directory:** `C:/Users/marley/webapp-test/scripts`
**Blog Data File:** `C:/Users/marley/webapp-test/src/data/blog.ts`
**Public Images:** `C:/Users/marley/webapp-test/public`
**Preview Template:** `C:/Users/marley/webapp-test/scripts/preview-template.html`

## User's Description

$ARGUMENTS

---

## STEP 1: Gather Context

First, gather context from the CURRENT repository (where the user ran the command):

1. **Recent Git History:**
```bash
git log -5 --oneline
```

2. **Check for Plan Files:**
```bash
ls .agents/plans/ 2>/dev/null || echo "No plans directory"
```

3. **Read any recent plan files** that seem relevant to the user's description.

Summarize what you learned about the feature/update being announced.

---

## STEP 2: Generate Initial Article

Based on the context and user's description, generate:

### Article Fields:

1. **title** (5-10 words, catchy headline)
2. **slug** (kebab-case, URL-friendly, derived from title)
3. **excerpt** (1-2 sentences, hooks the reader, ~150 characters)
4. **content** (150-300 words, markdown format with ## headers and bullet points)
5. **category** (one of: product, engineering, announcement, company)
   - `product` - New features, app updates, releases
   - `engineering` - Technical deep-dives, architecture
   - `announcement` - Company news, milestones, launches
   - `company` - Team updates, culture, general news
6. **imageSubject** (2-4 words describing image subject for 3D render)

### Content Guidelines:
- Write in first-person plural ("We're excited to announce...")
- Use markdown headers (## and ###) for structure
- Include bullet points for features/benefits
- Keep tone professional but approachable
- End with a call-to-action or forward-looking statement

Present all generated fields to the user clearly formatted.

---

## STEP 3: Generate Image

Run the image generation script:

```bash
node C:/Users/marley/webapp-test/scripts/generate-blog-image.mjs "{imageSubject}" "C:/Users/marley/webapp-test/public/blog-{slug}.png"
```

Wait for completion and confirm the image was saved.

---

## STEP 4: Create Preview

1. **Read the preview template:**
```bash
cat C:/Users/marley/webapp-test/scripts/preview-template.html
```

2. **Create a preview file** at `C:/Users/marley/webapp-test/scripts/preview-current.html` by replacing all placeholders:
   - `{{TITLE}}` → generated title
   - `{{SLUG}}` → generated slug
   - `{{EXCERPT}}` → generated excerpt
   - `{{CONTENT_HTML}}` → convert markdown content to HTML (replace ## with <h2>, ### with <h3>, - with <li>, paragraphs with <p>)
   - `{{CATEGORY}}` → generated category
   - `{{IMAGE_PATH}}` → `../public/blog-{slug}.png`
   - `{{DATE}}` → today's date formatted as "December 28, 2024"
   - `{{AUTHOR}}` → "Siphio Team"
   - `{{TITLE_INITIAL}}` → first character of title

3. **Open in browser:**
```bash
start C:/Users/marley/webapp-test/scripts/preview-current.html
```

Tell the user: "I've opened the preview in your browser. Take a look and let me know if you'd like any changes."

---

## STEP 5: Iterative Edit Loop

Now enter the edit loop. Ask the user:

**"How does it look? You can:**
- **Approve**: Say `yes` or `publish` to proceed
- **Edit title**: "change title to [new title]"
- **Edit excerpt**: "make excerpt shorter" or "change excerpt to [text]"
- **Edit content**: "add a section about X" or "remove the bullet about Y"
- **Change category**: "change category to engineering"
- **Regenerate image**: "regenerate image with [new subject]"
- **Cancel**: Say `cancel` to abort

**What would you like to do?"**

### Handling Edits:

**For title changes:**
- Update the title
- Regenerate slug from new title
- Update the preview file
- Re-open browser

**For excerpt changes:**
- Update the excerpt
- Update the preview file
- Re-open browser

**For content changes:**
- Modify the content as requested
- Update the preview file
- Re-open browser

**For category changes:**
- Update the category (must be one of: product, engineering, announcement, company, hiring)
- Update the preview file
- Re-open browser

**For image regeneration:**
- Run the image generation script with new subject
- Update the preview file (if slug changed)
- Re-open browser

After each edit, show the updated field and re-open the preview.

**Continue this loop until the user says "yes", "publish", or "approve".**

---

## STEP 6: Update blog.ts

Once approved, update the blog data file:

1. **Read current blog.ts:**
```bash
cat C:/Users/marley/webapp-test/src/data/blog.ts
```

2. **Find the highest existing ID** in the blogPosts array and increment by 1.

3. **Create the new blog post entry** following this exact format:
```typescript
  {
    id: "{next_id}",
    slug: "{slug}",
    title: "{title}",
    excerpt: "{excerpt}",
    content: `{content}`,
    category: "{category}",
    image: "/blog-{slug}.png",
    author: {
      name: "Siphio Team",
    },
    publishedAt: "{YYYY-MM-DD}",
    featured: false,
  },
```

4. **Insert the new post at the BEGINNING of the blogPosts array** (after the `export const blogPosts: BlogPost[] = [` line).

5. **Write the updated file** using the Edit tool.

---

## STEP 7: Commit Changes

Stage and commit the changes:

```bash
cd C:/Users/marley/webapp-test && git add src/data/blog.ts public/blog-{slug}.png
```

```bash
cd C:/Users/marley/webapp-test && git status
```

Create the commit with conventional commit format:

```bash
cd C:/Users/marley/webapp-test && git commit -m "feat(blog): Add article - {title}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## STEP 8: Optional Push

Ask the user:

**"Article committed! Push to live? (yes/no)"**

If yes:
```bash
cd C:/Users/marley/webapp-test && git push
```

Then confirm: "Pushed! Your article will be live at siphio.ai/blog/{slug} in ~2 minutes after Vercel deploys."

If no:
Confirm: "No problem! The commit is ready locally. Run `git push` when you're ready to deploy."

---

## STEP 9: Cleanup

Delete the temporary preview file:
```bash
rm C:/Users/marley/webapp-test/scripts/preview-current.html
```

---

## Error Handling

**If image generation fails:**
- Check if FAL_KEY is set in C:/Users/marley/webapp-test/.env.local
- Offer to continue without image or retry

**If git operations fail:**
- Check if there are uncommitted changes in webapp-test
- Offer to stash changes or abort

**If blog.ts parsing fails:**
- Show the error and offer to manually insert the post

---

## Summary

After completion, provide a summary:

```
✅ Article Published Successfully!

📝 Title: {title}
🏷️ Category: {category}
🔗 Slug: /blog/{slug}
🖼️ Image: /public/blog-{slug}.png
📅 Date: {date}

{Pushed/Ready to push}
```
```

---

## TESTING STRATEGY

### Manual Validation

Since this is a slash command (markdown file), testing is manual:

1. **Command Discovery Test:**
   - Run `/help` in Claude Code
   - Verify `/publish-article` appears with description

2. **Basic Execution Test:**
   - Navigate to a test repo
   - Run `/publish-article "Test article about new feature"`
   - Verify context gathering works
   - Verify content generation works

3. **Image Generation Test:**
   - Verify image is generated in public/
   - Verify image appears in preview

4. **Preview Test:**
   - Verify preview opens in browser
   - Verify all placeholders are replaced
   - Verify styling matches actual blog

5. **Edit Loop Tests:**
   - Test: "change title to New Title"
   - Test: "make excerpt shorter"
   - Test: "change category to engineering"
   - Test: "regenerate image with rocket ship"
   - Verify preview updates after each edit

6. **Publishing Test:**
   - Say "yes" to approve
   - Verify blog.ts is updated correctly
   - Verify git commit is created
   - Verify push works (if confirmed)

7. **Cancel Test:**
   - Say "cancel" during edit loop
   - Verify no changes made to blog.ts
   - Verify cleanup happens

### Edge Cases

- Empty description: Should ask for clarification
- Very long content: Should truncate or warn
- Invalid category request: Should offer valid options
- Image generation timeout: Should offer retry or skip
- No git repo in current directory: Should still work (context limited)
- webapp-test has uncommitted changes: Should warn user

---

## VALIDATION COMMANDS

### Level 1: File Exists

```bash
ls ~/.claude/commands/publish-article.md
```

**Expected**: File exists

### Level 2: Command Structure

```bash
head -20 ~/.claude/commands/publish-article.md
```

**Expected**: Shows frontmatter with description and allowed-tools

### Level 3: Discovery

Run `/help` in Claude Code and verify `/publish-article` appears.

### Level 4: Webapp-test Build

```bash
cd C:/Users/marley/webapp-test && npm run build
```

**Expected**: Build passes (blog.ts valid after any test publishes)

### Level 5: Lint Check

```bash
cd C:/Users/marley/webapp-test && npm run lint
```

**Expected**: No new errors

---

## ACCEPTANCE CRITERIA

- [ ] Command file created at `~/.claude/commands/publish-article.md`
- [ ] Command has proper frontmatter (description, allowed-tools)
- [ ] Command appears in `/help` output
- [ ] Context gathering works from any repo
- [ ] Content generation produces valid article fields
- [ ] Image generation integrates with generate-blog-image.mjs
- [ ] Preview opens in browser with all placeholders replaced
- [ ] Edit loop handles: title, excerpt, content, category, image
- [ ] Preview updates after each edit
- [ ] "yes/publish/approve" exits loop and proceeds
- [ ] "cancel" aborts without changes
- [ ] blog.ts updated with correct format
- [ ] New post inserted at beginning of array
- [ ] Git commit uses conventional commit format
- [ ] Optional push works
- [ ] Cleanup removes preview-current.html
- [ ] `npm run build` passes after publish
- [ ] `npm run lint` passes

---

## COMPLETION CHECKLIST

- [ ] Created `~/.claude/commands/` directory
- [ ] Created `publish-article.md` with full workflow
- [ ] Tested command discovery via `/help`
- [ ] Tested basic execution with sample description
- [ ] Tested image generation
- [ ] Tested preview generation and browser opening
- [ ] Tested edit loop (title, excerpt, content, category, image)
- [ ] Tested approval flow
- [ ] Tested cancel flow
- [ ] Tested blog.ts update
- [ ] Tested git commit
- [ ] Tested optional push
- [ ] Verified webapp-test build passes
- [ ] Verified webapp-test lint passes

---

## NOTES

### Design Decisions

1. **Absolute Paths**: Using absolute paths (C:/Users/marley/webapp-test) because the command runs from any directory. In the future, SIPHIO_BLOG_REPO env var could make this configurable.

2. **Iterative Loop**: The edit loop is conversational - users say what they want changed in natural language rather than selecting from a menu. This is more natural for Claude Code.

3. **Preview File**: Using preview-current.html as a temporary file that gets cleaned up. This avoids accumulating preview files.

4. **Content-to-HTML Conversion**: Simple conversion in the command (## → h2, - → li) rather than using a markdown library. Good enough for preview.

5. **Insert at Beginning**: New posts go at the start of the array so they appear first on the blog (most recent first).

6. **No Hiring Category Auto-Detect**: Hiring posts are manual-only per PRD to prevent false positives.

### Future Enhancements

- SIPHIO_BLOG_REPO environment variable for configurability
- Support for custom author names
- Draft mode (save without committing)
- Image style presets beyond 3D render

### Rollback

If something goes wrong during publish:
```bash
cd C:/Users/marley/webapp-test && git checkout src/data/blog.ts
rm public/blog-{slug}.png
```
