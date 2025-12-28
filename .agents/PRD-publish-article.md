# Product Requirements Document: `/publish-article` Automation

## 1. Executive Summary

The `/publish-article` automation is a global Claude Code slash command that streamlines the process of creating and publishing blog articles to the Siphio AI website. When working on any project—whether it's a new feature,r major release—developers can invoke this command to automatically generate a  bug fix, oprofessional blog post complete with AI-written content and a consistent 3D-rendered image.

The command gathers context from the current repository (git history, plan files), generates article content using Claude, creates a visually consistent image via fal.ai's GPT-Image-1.5 model, and presents a full browser preview before publishing. Upon approval, it updates the Siphio blog, commits the changes, and optionally pushes to deploy live.

**MVP Goal:** Deploy a fully functional slash command that enables one-command blog publishing from any repository, with browser preview validation and live deployment capability.

---

## 2. Mission

**Mission Statement:** Eliminate the friction between shipping features and announcing them—every significant release should be one command away from a professional blog post.

**Core Principles:**

1. **Cross-Repo Portability** - The command works from any repository, not just webapp-test
2. **Visual Consistency** - All generated images follow the same 3D render art style
3. **Human-in-the-Loop** - Full preview and approval required before publishing
4. **Context-Aware Generation** - Leverages git history and plan files for accurate content
5. **Deploy-Ready** - Optional push to trigger live deployment

---

## 3. Target Users

### Primary Persona: Developer/Founder
- **Who:** Marley (and future team members) working on Siphio projects
- **Technical Level:** High - comfortable with CLI tools and git workflows
- **Needs:** Quick way to document and announce features after shipping them
- **Pain Points:** Writing blog posts is tedious, creating consistent images is time-consuming, publishing involves multiple manual steps

### Secondary Persona: Future Team Contributors
- **Who:** Engineers or content creators joining Siphio
- **Technical Level:** Moderate to high
- **Needs:** Standardized way to contribute to the company blog
- **Pain Points:** Unfamiliar with blog publishing workflow, uncertain about content/image standards

---

## 4. MVP Scope

### In Scope

**Core Functionality:**
- ✅ Global slash command (`/publish-article`) accessible from any repository
- ✅ Context gathering from current repo (git log, .agents/plans/)
- ✅ AI-generated article content (title, slug, excerpt, full content)
- ✅ Auto-detected category based on content type
- ✅ Image generation via fal.ai GPT-Image-1.5 with consistent 3D style
- ✅ Full browser preview showing blog card + article content
- ✅ Manual approval step before publishing
- ✅ Automatic update of `blog.ts` in target repo
- ✅ Git commit with conventional commit message
- ✅ Optional git push for live deployment

**Technical:**
- ✅ Node.js image generation script using @fal-ai/client
- ✅ HTML preview template with Tailwind CSS styling
- ✅ Environment variable configuration (FAL_KEY, SIPHIO_BLOG_REPO)
- ✅ Cross-platform support (Windows primary, macOS/Linux compatible)

**Image Generation:**
- ✅ Consistent 3D render style prefix for all images
- ✅ 16:9 aspect ratio (1536x1024) for blog cards
- ✅ Medium quality setting (~$0.05/image)
- ✅ PNG output format

### Out of Scope

**Deferred Features:**
- ❌ Web UI for article editing (CLI-only for MVP)
- ❌ Image regeneration without full republish
- ❌ Draft/scheduled publishing
- ❌ Multi-author support with different styles
- ❌ Analytics integration (view counts, etc.)
- ❌ Social media cross-posting (Twitter, LinkedIn)
- ❌ SEO optimization suggestions
- ❌ Automatic PR creation instead of direct commit

**Technical Deferrals:**
- ❌ Database-backed blog (stays in blog.ts for MVP)
- ❌ CMS admin panel
- ❌ Image CDN integration (local /public/ for MVP)
- ❌ Automated testing of slash command

---

## 5. User Stories

### Primary User Stories

**US-1: Publish After Feature Completion**
> As a developer, I want to run a single command after completing a feature, so that I can quickly publish a blog post about what I shipped.

*Example:* After implementing AI chat assistant in gym-app:
```
/publish-article "Added AI chat assistant with lead capture flow"
```
→ Generates article, image, preview, publishes to Siphio blog.

**US-2: Context-Aware Content Generation**
> As a developer, I want the command to understand what I built from my git history and plan files, so that the generated content is accurate and relevant.

*Example:* Command reads `.agents/plans/phase-4-frontend-integration.md` and recent commits to understand the feature scope.

**US-3: Preview Before Publishing**
> As a developer, I want to see exactly how the article will look on the website before publishing, so that I can catch any issues or make edits.

*Example:* Browser opens showing the blog card with image, title, excerpt, and full article content.

**US-4: Consistent Visual Branding**
> As a developer, I want all blog images to have the same professional 3D render style, so that the blog has a cohesive visual identity.

*Example:* Every image uses the same glossy 3D render style prefix, regardless of subject matter.

**US-5: Cross-Repo Publishing**
> As a developer working on multiple projects, I want to publish blog posts about any project to the main Siphio blog, so that I don't have to switch repositories.

*Example:* Working in `macros-tracker/` repo, run `/publish-article` → publishes to `webapp-test/` blog.

**US-6: Live Deployment Option**
> As a developer, I want the option to push changes live immediately, so that the article appears on the website without additional manual steps.

*Example:* After approval, asked "Push to live?" → "yes" → git push triggers Vercel deploy.

### Technical User Stories

**US-7: Environment-Based Configuration**
> As a developer setting up the automation, I want configuration via environment variables, so that I can use different settings across machines.

**US-8: Graceful Error Handling**
> As a developer, I want clear error messages if something fails (API key missing, network error), so that I can quickly fix the issue.

---

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  ANY REPO (current working directory)                            │
│  > /publish-article "description of what was shipped"            │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  CLAUDE CODE SLASH COMMAND                                       │
│  ~/.claude/commands/publish-article.md                           │
│                                                                  │
│  1. Gather context (git log, .agents/plans/)                     │
│  2. Generate content (Claude)                                    │
│  3. Generate image (fal.ai script)                               │
│  4. Create & open browser preview                                │
│  5. Wait for user approval                                       │
│  6. Update target repo blog.ts                                   │
│  7. Commit and optionally push                                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  fal.ai API     │  │  Target Repo    │  │  Browser        │
│  GPT-Image-1.5  │  │  webapp-test    │  │  Preview        │
│                 │  │                 │  │                 │
│  - 3D renders   │  │  - blog.ts      │  │  - Card view    │
│  - 1536x1024    │  │  - /public/     │  │  - Full article │
│  - $0.05/image  │  │  - git ops      │  │  - Approval UI  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Directory Structure

```
~/.claude/commands/
└── publish-article.md          # Global slash command

$SIPHIO_BLOG_REPO (C:\Users\marley\webapp-test)
├── scripts/
│   ├── generate-blog-image.mjs # fal.ai image generator
│   └── preview-template.html   # Browser preview template
├── src/
│   └── data/
│       └── blog.ts             # Blog posts array (modified)
├── public/
│   └── blog-{slug}.png         # Generated images (created)
├── .env.local                  # FAL_KEY (modified)
└── package.json                # @fal-ai/client dependency
```

### Key Design Patterns

1. **Global Command Pattern** - Slash command in `~/.claude/commands/` accessible from any repo
2. **Environment-Based Targeting** - `SIPHIO_BLOG_REPO` env var points to target blog repo
3. **Preview-Before-Publish** - Browser preview with explicit approval required
4. **Conventional Commits** - `feat(blog): Add article - {title}` format
5. **Idempotent Updates** - Auto-increment ID, no duplicates on re-run

---

## 7. Tools/Features

### Feature 1: Context Gathering

**Purpose:** Extract relevant information from the current repository to inform article generation.

**Operations:**
- Read recent git commits (`git log -5 --oneline`)
- Scan `.agents/plans/` directory for plan files
- Parse user-provided description from command arguments

**Key Features:**
- Works in any git repository
- Gracefully handles repos without `.agents/` directory
- Combines multiple context sources for rich generation

---

### Feature 2: Content Generation

**Purpose:** Generate professional blog article content using Claude.

**Generated Fields:**
```typescript
{
  title: string;      // 5-10 words, catchy headline
  slug: string;       // kebab-case-url-friendly
  excerpt: string;    // 1-2 sentences, hook the reader
  content: string;    // 150-300 words, markdown format
  category: string;   // Auto-detected: product|engineering|announcement|company
}
```

**Category Detection Rules:**
- `product` - New features, app updates, releases
- `engineering` - Technical deep-dives, architecture decisions
- `announcement` - Company news, milestones, partnerships
- `company` - Team updates, culture, general news
- `hiring` - Job postings (manual only, not auto-detected)

---

### Feature 3: Image Generation

**Purpose:** Generate consistent 3D render images for blog articles via fal.ai.

**API Configuration:**
```javascript
{
  model: "fal-ai/gpt-image-1.5",
  image_size: "1536x1024",  // 16:9 aspect ratio
  quality: "medium",        // ~$0.05/image
  output_format: "png"
}
```

**Style Prompt Prefix (applied to all images):**
```
Glossy 3D render, reflective surfaces, clean gradient background,
soft studio lighting, minimal composition, modern tech aesthetic,
no text, no logos, centered subject, professional product shot
```

**Subject Generation:** Derived from article title/content (e.g., "AI chat assistant" → 3D robot with chat bubbles)

---

### Feature 4: Browser Preview

**Purpose:** Show full WYSIWYG preview before publishing.

**Preview Contents:**
- Blog card exactly as it appears on the website
- 16:9 image with actual generated image
- Category badge with correct color
- Title and excerpt
- Full article content below card
- Today's date

**Preview Actions:**
- `yes` - Proceed with publishing
- `edit` - Modify generated content
- `cancel` - Abort without changes

---

### Feature 5: Publishing

**Purpose:** Update the Siphio blog with new article.

**Operations:**
1. Read `$SIPHIO_BLOG_REPO/src/data/blog.ts`
2. Parse `blogPosts` array
3. Generate new ID (auto-increment)
4. Insert new post at beginning of array
5. Write updated file
6. Stage changes: `git add src/data/blog.ts public/blog-{slug}.png`
7. Commit: `git commit -m "feat(blog): Add article - {title}"`
8. Optionally push: `git push` (triggers Vercel deploy)

---

## 8. Technology Stack

### Slash Command
| Technology | Purpose |
|------------|---------|
| Claude Code | Slash command execution environment |
| Markdown | Command definition format |

### Image Generation Script
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime for image generation script |
| @fal-ai/client | Latest | fal.ai API client |
| ES Modules | - | Modern JavaScript module format |

### Preview Template
| Technology | Purpose |
|------------|---------|
| HTML5 | Preview document structure |
| Tailwind CSS (CDN) | Styling matching webapp-test |
| Inline CSS | Category badge colors |

### Target Repository (webapp-test)
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | Web framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |

### External Services
| Service | Purpose | Cost |
|---------|---------|------|
| fal.ai | Image generation API | ~$0.05/image (medium quality) |
| Vercel | Hosting & deployment | Free tier |

### Dependencies to Add
```bash
# In webapp-test
npm install @fal-ai/client
```

---

## 9. Security & Configuration

### Configuration Management

**Environment Variables:**

| Variable | Location | Required | Purpose |
|----------|----------|----------|---------|
| `FAL_KEY` | `webapp-test/.env.local` | Yes | fal.ai API authentication |
| `SIPHIO_BLOG_REPO` | Shell profile | Yes | Absolute path to target repo |

**Example Setup:**
```bash
# ~/.bashrc or ~/.zshrc (or Windows environment variables)
export FAL_KEY="your_fal_ai_key_here"
export SIPHIO_BLOG_REPO="C:\Users\marley\webapp-test"
```

### Security Scope

**In Scope (MVP):**
- ✅ API key stored in environment variable (not committed)
- ✅ Manual approval before any git operations
- ✅ Explicit confirmation before pushing to remote
- ✅ No sensitive data in generated content

**Out of Scope (MVP):**
- ❌ API key rotation
- ❌ Rate limiting on image generation
- ❌ Audit logging of published articles
- ❌ Role-based publishing permissions

### Git Safety
- Never force push
- Always use conventional commit format
- Commit only to current branch
- User must explicitly approve push to remote

---

## 10. API Specification

### fal.ai GPT-Image-1.5 API

**Endpoint:** `fal-ai/gpt-image-1.5` (via @fal-ai/client)

**Request:**
```javascript
{
  input: {
    prompt: "Glossy 3D render... {subject}",
    image_size: "1536x1024",
    quality: "medium",
    num_images: 1,
    output_format: "png"
  }
}
```

**Response:**
```javascript
{
  data: {
    images: [{
      url: "https://v3b.fal.media/files/...",
      width: 1536,
      height: 1024,
      content_type: "image/png"
    }]
  }
}
```

### BlogPost Interface (blog.ts)

```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "company" | "hiring" | "product" | "announcement" | "engineering";
  image?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;  // ISO date: "2024-12-28"
  featured?: boolean;
}
```

---

## 11. Success Criteria

### MVP Success Definition

The MVP is successful when:
1. Running `/publish-article "description"` from any repo generates a complete article
2. The browser preview accurately represents the final blog card appearance
3. After approval, the article appears correctly on the Siphio blog
4. Images have consistent 3D render style across multiple generations
5. The entire flow completes in under 60 seconds

### Functional Requirements

- ✅ Command executable from any git repository
- ✅ Context gathered from git log and plan files
- ✅ Article content generated (title, slug, excerpt, content, category)
- ✅ Image generated with consistent 3D style
- ✅ Browser preview opens automatically
- ✅ User can approve, edit, or cancel
- ✅ blog.ts updated with new post
- ✅ Changes committed with conventional commit message
- ✅ Optional push to trigger deployment
- ✅ Error handling for missing env vars, API failures

### Quality Indicators

- Image generation latency < 30 seconds
- Content generation quality (human-readable, accurate to context)
- Preview fidelity (matches actual blog appearance)
- Zero failed publishes due to automation bugs
- Consistent image style across 10+ generations

---

## 12. Implementation Phases

### Phase 1: Foundation
**Goal:** Set up infrastructure and dependencies

**Deliverables:**
- ✅ Create `scripts/` directory in webapp-test
- ✅ Install `@fal-ai/client` dependency
- ✅ Configure `FAL_KEY` in `.env.local`
- ✅ Document `SIPHIO_BLOG_REPO` setup in README

**Validation:** `npm install` succeeds, env vars accessible

---

### Phase 2: Image Generation Script
**Goal:** Working fal.ai integration

**Deliverables:**
- ✅ Create `scripts/generate-blog-image.mjs`
- ✅ Implement fal.ai API call with style prefix
- ✅ Download and save image to specified path
- ✅ Handle errors gracefully

**Validation:** `node scripts/generate-blog-image.mjs "robot" "./test.png"` produces image

---

### Phase 3: Preview Template
**Goal:** Browser preview matching blog styling

**Deliverables:**
- ✅ Create `scripts/preview-template.html`
- ✅ Implement card styling matching blog-page.tsx
- ✅ Add category badge colors
- ✅ Include full article preview section
- ✅ Add placeholder markers for dynamic content

**Validation:** Opening template in browser shows styled card layout

---

### Phase 4: Slash Command
**Goal:** Complete automation workflow

**Deliverables:**
- ✅ Create `~/.claude/commands/publish-article.md`
- ✅ Implement context gathering logic
- ✅ Implement content generation prompts
- ✅ Implement preview generation and browser opening
- ✅ Implement approval flow
- ✅ Implement blog.ts update logic
- ✅ Implement git commit and push flow

**Validation:** End-to-end test from `/publish-article` to live deployment

---

## 13. Future Considerations

### Post-MVP Enhancements

**Content & Editing:**
- Web-based editor for article refinement
- Draft saving and scheduled publishing
- Multi-language article generation
- SEO metadata generation (meta description, keywords)

**Image Enhancements:**
- Image regeneration without full republish
- Multiple style presets (3D, illustrated, photo-realistic)
- Image cropping/editing in preview
- Automatic alt text generation

**Distribution:**
- Social media cross-posting (Twitter, LinkedIn)
- Email newsletter integration
- RSS feed generation
- Slack notifications on publish

**Analytics:**
- View count tracking
- Popular articles dashboard
- A/B testing for titles

**Infrastructure:**
- CMS backend (replace blog.ts with database)
- Image CDN integration
- Automated PR creation instead of direct commit
- Multi-repo blog federation

---

## 14. Risks & Mitigations

### Risk 1: fal.ai API Availability
**Impact:** High - Image generation fails, blocking publish
**Mitigation:**
- Graceful fallback to publish without image
- Cache previously generated images for retry
- Alert on API errors

### Risk 2: Inconsistent Image Style
**Impact:** Medium - Blog loses visual cohesion
**Mitigation:**
- Hardcoded style prefix ensures consistency
- Review images in preview before publishing
- Document style guidelines for manual override

### Risk 3: Accidental Production Push
**Impact:** High - Unwanted content goes live
**Mitigation:**
- Explicit "Push to live?" confirmation step
- Browser preview shows exactly what will publish
- Easy rollback via git revert

### Risk 4: Environment Variable Misconfiguration
**Impact:** Medium - Command fails on first use
**Mitigation:**
- Clear error messages for missing env vars
- Setup documentation with copy-paste commands
- Validation check at command start

### Risk 5: Blog.ts Parse Errors
**Impact:** Medium - Publishing fails, manual recovery needed
**Mitigation:**
- Read file and validate structure before modification
- Create backup before writing
- Atomic write operation

---

## 15. Appendix

### Related Documents
- Implementation Plan: `.agents/plans/adaptive-dreaming-bachman.md`
- Main Project PRD: `.agents/PRD.md`
- Blog Data Structure: `src/data/blog.ts`
- Blog Page Component: `src/components/blocks/blog-page.tsx`

### External Documentation
- [fal.ai GPT-Image-1.5 API](https://fal.ai/models/fal-ai/gpt-image-1.5/api)
- [fal.ai Client Documentation](https://docs.fal.ai/)
- [Claude Code Slash Commands](https://docs.anthropic.com/claude-code)

### File Paths Summary

| File | Action | Purpose |
|------|--------|---------|
| `~/.claude/commands/publish-article.md` | CREATE | Global slash command |
| `webapp-test/scripts/generate-blog-image.mjs` | CREATE | fal.ai image generator |
| `webapp-test/scripts/preview-template.html` | CREATE | Browser preview template |
| `webapp-test/.env.local` | MODIFY | Add FAL_KEY |
| `webapp-test/package.json` | MODIFY | Add @fal-ai/client |
| `webapp-test/src/data/blog.ts` | MODIFIED AT RUNTIME | New articles added here |
| `webapp-test/public/blog-*.png` | CREATED AT RUNTIME | Generated images |

### Example Execution

```
$ cd ~/projects/gym-app
$ /publish-article "Added workout tracking with AI form analysis"

[Claude gathers context from gym-app repo]
[Claude generates article content]
[Claude runs image generation script]
[Browser opens with preview]

Claude: "Here's your article preview. Publish? (yes/edit/cancel)"
User: "yes"

[Claude updates webapp-test/src/data/blog.ts]
[Claude commits: "feat(blog): Add article - AI-Powered Workout Tracking"]

Claude: "Push to live? (yes/no)"
User: "yes"

[Claude runs git push]

Claude: "Published! Article will be live at siphio.ai/blog/ai-powered-workout-tracking in ~2 minutes."
```
