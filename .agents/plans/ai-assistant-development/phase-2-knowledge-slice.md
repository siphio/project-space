# Feature: Phase 2 - Knowledge Slice

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Implement the Knowledge Search feature as a complete vertical slice. This provides the AI agent with a `search_knowledge_base` tool that queries structured JSON files containing Siphio's business information - apps, services, blog content, and company details. The agent will use this tool to answer user questions accurately instead of relying on potentially outdated training data.

## User Story

As a **website visitor**
I want to **ask the AI assistant about Siphio's products and services**
So that **I receive accurate, up-to-date information without the AI making things up**

## Problem Statement

The Phase 1 agent can only provide high-level product information hardcoded in its system prompt. When users ask detailed questions (features, tech stack, pricing approach, blog content), the agent either makes things up or admits it doesn't know. This limits usefulness and risks providing inaccurate information.

## Solution Statement

Create a knowledge vertical slice (`agent/features/knowledge/`) containing:
- JSON data files mirroring `src/data/apps.ts` and `src/data/blog.ts` plus new services/company info
- A Pydantic AI tool `search_knowledge_base` with keyword/fuzzy matching
- Category filtering (apps, services, blog, company)
- Response format toggle (concise/detailed) for token efficiency
- Helpful suggestions when no results found

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

- `agent/core/agent.py` (lines 1-28) - Current agent setup; tools registered via `@agent.tool` decorator
- `agent/core/prompts.py` (lines 1-34) - System prompt to UPDATE with tool usage instructions
- `agent/main.py` (lines 69-91) - Chat endpoint; UPDATE to include `tools_called` from result
- `src/data/apps.ts` (lines 1-94) - Source data for apps.json (3 apps with updates)
- `src/data/blog.ts` (lines 1-215) - Source data for blog_index.json (6 blog posts)
- `CLAUDE.md` (lines 142-178) - Tool definition pattern with KnowledgeResult model
- `.agents/PRD.md` (lines 370-410) - Tool 1 specification: parameters, returns, key features

### New Files to Create

```
agent/features/knowledge/
├── __init__.py           # Slice exports
├── tool.py               # Pydantic AI tool definition
├── search.py             # Search logic (keyword + fuzzy matching)
├── models.py             # KnowledgeResult and related types
└── data/
    ├── apps.json         # App catalog (from apps.ts)
    ├── services.json     # Freelancing services info
    ├── blog_index.json   # Blog summaries (from blog.ts)
    └── company.json      # Company info, mission, tech stack
```

### Relevant Documentation - READ BEFORE IMPLEMENTING

- [Pydantic AI Tools Guide](https://ai.pydantic.dev/tools/)
  - Specific section: `@agent.tool` decorator syntax
  - Why: Shows how to register tools with context access

- [Pydantic AI Tool Parameters](https://ai.pydantic.dev/tools/#extracting-parameters-from-the-docstring)
  - Specific section: Google-style docstrings for parameter descriptions
  - Why: Ensures tool schema is properly generated for LLM

- [RapidFuzz Library](https://rapidfuzz.github.io/RapidFuzz/)
  - Specific section: fuzz.partial_ratio for fuzzy matching
  - Why: Enables flexible search without exact keyword matches

### Patterns to Follow

**Vertical Slice Structure (from CLAUDE.md:80-91):**
```
features/knowledge/
├── __init__.py      # Exports
├── tool.py          # Tool definition
├── search.py        # Business logic
├── models.py        # Types
└── data/            # JSON files
```

**Tool Definition Pattern (from CLAUDE.md:145-178):**
```python
from pydantic import BaseModel
from typing import Optional

class KnowledgeResult(BaseModel):
    """Result from knowledge search."""
    found: bool
    category: str
    results: list[dict]
    suggestion: Optional[str] = None

@agent.tool
async def search_knowledge_base(
    ctx: RunContext[AgentDeps],
    query: str,
    category: Optional[str] = None,
    response_format: str = "concise"
) -> KnowledgeResult:
    """Search Siphio's knowledge base."""
```

**Naming Conventions:**
- Files: `snake_case.py`
- Functions: `snake_case()`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

**Import Order:**
```python
# 1. Standard library
from typing import Optional
import json

# 2. Third-party
from pydantic import BaseModel

# 3. Local
from .models import KnowledgeResult
```

---

## IMPLEMENTATION PLAN

### Phase 1: Data Files

Create JSON knowledge files from existing TypeScript data sources.

**Tasks:**
- Create `data/` directory structure
- Convert `apps.ts` → `apps.json`
- Convert `blog.ts` → `blog_index.json`
- Create new `services.json` and `company.json`

### Phase 2: Models & Types

Define Pydantic models for search results.

**Tasks:**
- Create `models.py` with KnowledgeResult, SearchResultItem
- Define category literals and response format types

### Phase 3: Search Logic

Implement the search engine with keyword and fuzzy matching.

**Tasks:**
- Create `search.py` with data loading
- Implement keyword matching
- Add fuzzy matching with rapidfuzz
- Implement category filtering
- Add response format handling (concise/detailed)

### Phase 4: Tool Registration

Register the tool with the Pydantic AI agent.

**Tasks:**
- Create `tool.py` with @agent.tool decorator
- Update `core/agent.py` to import tool
- Update `core/prompts.py` with tool usage instructions
- Update `main.py` to return tools_called

### Phase 5: Testing

Validate the knowledge slice works end-to-end.

**Tasks:**
- Test data file loading
- Test search with various queries
- Test category filtering
- Test concise vs detailed response formats
- Test API endpoint with tool calls

---

## STEP-BY-STEP TASKS

### 1. CREATE agent/features/knowledge/data/apps.json

- **IMPLEMENT**: Convert apps.ts data to JSON format
- **SOURCE**: `src/data/apps.ts` (lines 21-85)
- **CONTENT**:
```json
{
  "apps": [
    {
      "slug": "spending-insights",
      "name": "Spending Insights",
      "tagline": "AI-driven financial clarity",
      "description": "Connect your accounts and let the AI surface spending patterns, flag anomalies, and deliver insights you'd actually miss.",
      "tech_stack": ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Claude AI", "Plaid API"],
      "why_built": "We built Spending Insights because managing personal finances shouldn't require a spreadsheet degree.",
      "how_built": "Built with Next.js for a fast, responsive frontend. Supabase handles authentication and real-time data. Claude AI powers the intelligent insights engine.",
      "features": ["AI spending analysis", "Anomaly detection", "Subscription tracking", "Renewal alerts"],
      "updates": [
        {"date": "2024-12-27", "title": "Initial release of Spending Insights"},
        {"date": "2024-12-26", "title": "Added subscription tracking feature"}
      ]
    }
  ]
}
```
- **GOTCHA**: Ensure all 3 apps from apps.ts are included
- **VALIDATE**: `python -c "import json; json.load(open('features/knowledge/data/apps.json'))"`

---

### 2. CREATE agent/features/knowledge/data/blog_index.json

- **IMPLEMENT**: Convert blog.ts to JSON with summaries (not full content)
- **SOURCE**: `src/data/blog.ts` (lines 17-196)
- **CONTENT**:
```json
{
  "posts": [
    {
      "slug": "welcome-to-siphio-ai",
      "title": "Welcome to Siphio AI",
      "excerpt": "We're excited to announce the official launch of Siphio AI...",
      "category": "announcement",
      "author": "Siphio Team",
      "published_at": "2024-12-27",
      "topics": ["launch", "mission", "products", "AI-native"],
      "featured": true
    }
  ]
}
```
- **GOTCHA**: Include all 6 blog posts; add `topics` array for searchability
- **VALIDATE**: `python -c "import json; d=json.load(open('features/knowledge/data/blog_index.json')); print(len(d['posts']))"`

---

### 3. CREATE agent/features/knowledge/data/services.json

- **IMPLEMENT**: New file defining Siphio's freelancing/consulting services
- **CONTENT**:
```json
{
  "services": [
    {
      "name": "AI Agent Development",
      "description": "Custom AI agents built for your specific business workflows. We design, build, and deploy reasoning agents that handle complex tasks autonomously.",
      "deliverables": ["Custom agent architecture", "Tool integration", "Testing & deployment", "Documentation"],
      "ideal_for": ["Startups needing automation", "Enterprises with complex workflows", "Products requiring AI features"],
      "approach": "We work in 2-week sprints with clear deliverables. You get working software, not PowerPoint decks."
    },
    {
      "name": "AI Integration Consulting",
      "description": "Strategic guidance on integrating AI into your existing products. We help you identify high-impact opportunities and avoid common pitfalls.",
      "deliverables": ["Technical assessment", "Integration roadmap", "Architecture recommendations", "Proof of concept"],
      "ideal_for": ["Teams exploring AI", "CTOs evaluating options", "Products adding AI features"],
      "approach": "We start with a technical deep-dive to understand your stack, then deliver actionable recommendations."
    },
    {
      "name": "Full-Stack Development",
      "description": "End-to-end application development with AI at the core. We build complete products, not just AI components.",
      "deliverables": ["Full application", "API design", "Frontend & backend", "Deployment pipeline"],
      "ideal_for": ["New product builds", "MVP development", "Rebuilding legacy systems"],
      "approach": "Modern stack (Next.js, Python, Supabase) with AI-native architecture from day one."
    }
  ],
  "pricing_approach": "We price based on value delivered, not hours worked. Typical engagements range from $5K for focused consulting to $50K+ for full product builds. We'll give you a clear quote after understanding your needs.",
  "contact": "Reach out through the chat assistant or email hello@siphio.ai"
}
```
- **VALIDATE**: `python -c "import json; json.load(open('features/knowledge/data/services.json'))"`

---

### 4. CREATE agent/features/knowledge/data/company.json

- **IMPLEMENT**: Company information, mission, and technology details
- **CONTENT**:
```json
{
  "company": {
    "name": "Siphio AI",
    "tagline": "Building software that actually thinks",
    "mission": "We build AI-native applications - software designed from the ground up with intelligence at its core, not as an afterthought.",
    "founded": "2024",
    "location": "Remote-first, based in the US",
    "team_size": "Small team of senior engineers",
    "philosophy": "We believe AI shouldn't be bolted onto existing products. We design software where intelligence is woven into every interaction."
  },
  "technology": {
    "frontend": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    "backend": ["Python", "FastAPI", "Pydantic AI"],
    "ai": ["Claude AI", "Grok", "Custom reasoning agents"],
    "infrastructure": ["Supabase", "PostgreSQL", "Vercel"],
    "approach": "We use modern, well-supported technologies. No bleeding-edge experiments in production - we ship reliable software."
  },
  "values": [
    "Accuracy over fabrication - we never make up information",
    "Simplicity over complexity - the best code is code you don't write",
    "Shipping over planning - working software beats perfect plans",
    "Honesty over hype - we tell you what AI can and can't do"
  ],
  "contact": {
    "general": "hello@siphio.ai",
    "careers": "careers@siphio.ai",
    "support": "Use the chat assistant on our website"
  }
}
```
- **VALIDATE**: `python -c "import json; json.load(open('features/knowledge/data/company.json'))"`

---

### 5. CREATE agent/features/knowledge/models.py

- **IMPLEMENT**: Pydantic models for search functionality
- **PATTERN**: From CLAUDE.md lines 151-156
- **CONTENT**:
```python
"""Data models for knowledge search feature."""

from typing import Optional, Literal
from pydantic import BaseModel, Field


# Category type for filtering
CategoryType = Literal["apps", "services", "blog", "company"]

# Response format type
ResponseFormat = Literal["concise", "detailed"]


class SearchResultItem(BaseModel):
    """Single search result item."""

    title: str = Field(..., description="Title of the matched content")
    content: str = Field(..., description="Relevant content snippet or full content")
    relevance: str = Field(..., description="Why this result matches the query")
    source: str = Field(..., description="Category and identifier of source")
    score: float = Field(ge=0, le=100, description="Match score 0-100")


class KnowledgeResult(BaseModel):
    """Result from knowledge base search."""

    found: bool = Field(..., description="Whether any results were found")
    category: str = Field(..., description="Category searched or 'all'")
    results: list[SearchResultItem] = Field(
        default_factory=list, description="List of matching results"
    )
    suggestion: Optional[str] = Field(
        None, description="Suggestion if no results found"
    )
    query: str = Field(..., description="Original search query")
```
- **VALIDATE**: `python -c "from features.knowledge.models import KnowledgeResult; print('Models OK')"`

---

### 6. UPDATE agent/requirements.txt

- **IMPLEMENT**: Add rapidfuzz for fuzzy matching
- **ADD** (after httpx line):
```
# Text matching
rapidfuzz>=3.0.0
```
- **VALIDATE**: `pip install rapidfuzz && python -c "from rapidfuzz import fuzz; print('rapidfuzz OK')"`

---

### 7. CREATE agent/features/knowledge/search.py

- **IMPLEMENT**: Search engine with keyword and fuzzy matching
- **CONTENT**:
```python
"""Search logic for knowledge base."""

import json
from pathlib import Path
from typing import Optional

from rapidfuzz import fuzz

from .models import KnowledgeResult, SearchResultItem, CategoryType, ResponseFormat


# Path to data directory
DATA_DIR = Path(__file__).parent / "data"

# Cached data (loaded once)
_cache: dict = {}


def _load_data() -> dict:
    """Load all knowledge data files into cache."""
    if _cache:
        return _cache

    for filename in ["apps.json", "services.json", "blog_index.json", "company.json"]:
        filepath = DATA_DIR / filename
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                key = filename.replace(".json", "").replace("_index", "")
                _cache[key] = json.load(f)

    return _cache


def _calculate_score(query: str, text: str) -> float:
    """Calculate match score using fuzzy matching."""
    query_lower = query.lower()
    text_lower = text.lower()

    # Exact substring match gets high score
    if query_lower in text_lower:
        return 95.0

    # Use partial ratio for fuzzy matching
    return fuzz.partial_ratio(query_lower, text_lower)


def _search_apps(query: str, response_format: ResponseFormat) -> list[SearchResultItem]:
    """Search app catalog."""
    data = _load_data()
    apps = data.get("apps", {}).get("apps", [])
    results = []

    for app in apps:
        # Build searchable text
        searchable = f"{app['name']} {app['tagline']} {app['description']} {' '.join(app.get('features', []))}"
        score = _calculate_score(query, searchable)

        if score >= 60:
            if response_format == "concise":
                content = f"{app['tagline']}. {app['description'][:150]}..."
            else:
                content = (
                    f"**{app['name']}**: {app['tagline']}\n\n"
                    f"{app['description']}\n\n"
                    f"**Tech Stack**: {', '.join(app['tech_stack'])}\n\n"
                    f"**Why Built**: {app['why_built']}"
                )

            results.append(
                SearchResultItem(
                    title=app["name"],
                    content=content,
                    relevance=f"Matched on app name/description (score: {score:.0f})",
                    source=f"apps/{app['slug']}",
                    score=score,
                )
            )

    return results


def _search_services(query: str, response_format: ResponseFormat) -> list[SearchResultItem]:
    """Search services catalog."""
    data = _load_data()
    services_data = data.get("services", {})
    services = services_data.get("services", [])
    results = []

    for service in services:
        searchable = f"{service['name']} {service['description']} {' '.join(service.get('ideal_for', []))}"
        score = _calculate_score(query, searchable)

        if score >= 60:
            if response_format == "concise":
                content = service["description"][:200]
            else:
                content = (
                    f"**{service['name']}**\n\n"
                    f"{service['description']}\n\n"
                    f"**Deliverables**: {', '.join(service['deliverables'])}\n\n"
                    f"**Ideal For**: {', '.join(service['ideal_for'])}\n\n"
                    f"**Approach**: {service['approach']}"
                )

            results.append(
                SearchResultItem(
                    title=service["name"],
                    content=content,
                    relevance=f"Matched on service offering (score: {score:.0f})",
                    source=f"services/{service['name'].lower().replace(' ', '-')}",
                    score=score,
                )
            )

    # Also check pricing approach
    pricing = services_data.get("pricing_approach", "")
    if _calculate_score(query, f"pricing cost price {pricing}") >= 60:
        results.append(
            SearchResultItem(
                title="Pricing Approach",
                content=pricing,
                relevance="Matched on pricing query",
                source="services/pricing",
                score=85.0,
            )
        )

    return results


def _search_blog(query: str, response_format: ResponseFormat) -> list[SearchResultItem]:
    """Search blog posts."""
    data = _load_data()
    posts = data.get("blog", {}).get("posts", [])
    results = []

    for post in posts:
        topics = " ".join(post.get("topics", []))
        searchable = f"{post['title']} {post['excerpt']} {post['category']} {topics}"
        score = _calculate_score(query, searchable)

        if score >= 60:
            if response_format == "concise":
                content = post["excerpt"][:200]
            else:
                content = (
                    f"**{post['title']}**\n\n"
                    f"{post['excerpt']}\n\n"
                    f"**Category**: {post['category']}\n"
                    f"**Published**: {post['published_at']}\n"
                    f"**Author**: {post['author']}"
                )

            results.append(
                SearchResultItem(
                    title=post["title"],
                    content=content,
                    relevance=f"Matched on blog content (score: {score:.0f})",
                    source=f"blog/{post['slug']}",
                    score=score,
                )
            )

    return results


def _search_company(query: str, response_format: ResponseFormat) -> list[SearchResultItem]:
    """Search company information."""
    data = _load_data()
    company_data = data.get("company", {})
    company = company_data.get("company", {})
    tech = company_data.get("technology", {})
    values = company_data.get("values", [])
    results = []

    # Search company info
    company_text = f"{company.get('name', '')} {company.get('mission', '')} {company.get('philosophy', '')}"
    if _calculate_score(query, company_text) >= 60:
        if response_format == "concise":
            content = company.get("mission", "")
        else:
            content = (
                f"**{company.get('name', 'Siphio AI')}**: {company.get('tagline', '')}\n\n"
                f"**Mission**: {company.get('mission', '')}\n\n"
                f"**Philosophy**: {company.get('philosophy', '')}\n\n"
                f"**Founded**: {company.get('founded', '')} | "
                f"**Location**: {company.get('location', '')} | "
                f"**Team**: {company.get('team_size', '')}"
            )

        results.append(
            SearchResultItem(
                title="About Siphio AI",
                content=content,
                relevance="Matched on company information",
                source="company/about",
                score=90.0,
            )
        )

    # Search technology
    tech_text = f"technology tech stack {' '.join(tech.get('frontend', []))} {' '.join(tech.get('backend', []))} {' '.join(tech.get('ai', []))}"
    if _calculate_score(query, tech_text) >= 60:
        if response_format == "concise":
            all_tech = tech.get("frontend", []) + tech.get("backend", []) + tech.get("ai", [])
            content = f"Tech stack: {', '.join(all_tech)}"
        else:
            content = (
                f"**Frontend**: {', '.join(tech.get('frontend', []))}\n"
                f"**Backend**: {', '.join(tech.get('backend', []))}\n"
                f"**AI**: {', '.join(tech.get('ai', []))}\n"
                f"**Infrastructure**: {', '.join(tech.get('infrastructure', []))}\n\n"
                f"**Approach**: {tech.get('approach', '')}"
            )

        results.append(
            SearchResultItem(
                title="Technology Stack",
                content=content,
                relevance="Matched on technology query",
                source="company/technology",
                score=88.0,
            )
        )

    # Search values
    values_text = " ".join(values)
    if _calculate_score(query, f"values principles culture {values_text}") >= 60:
        results.append(
            SearchResultItem(
                title="Our Values",
                content="\n".join(f"• {v}" for v in values),
                relevance="Matched on company values",
                source="company/values",
                score=85.0,
            )
        )

    return results


def _get_suggestion(query: str, category: Optional[str]) -> str:
    """Generate helpful suggestion when no results found."""
    suggestions = [
        "Try asking about our apps: Spending Insights, Checklist Manager, or AI Agents",
        "Ask about our services: AI development, consulting, or full-stack development",
        "Check out our blog for articles about AI-native applications",
        "Ask about our company, team, or technology stack",
    ]

    if category == "apps":
        return "Try asking about Spending Insights, Checklist Manager, or AI Agents specifically."
    elif category == "services":
        return "Try asking about AI agent development, consulting, or pricing."
    elif category == "blog":
        return "Try asking about specific topics like AI-native apps, hiring, or our roadmap."
    elif category == "company":
        return "Try asking about our mission, team, values, or technology stack."

    return "I couldn't find specific information about that. " + suggestions[0]


async def execute_search(
    query: str,
    category: Optional[CategoryType] = None,
    response_format: ResponseFormat = "concise",
) -> KnowledgeResult:
    """
    Execute search across knowledge base.

    Args:
        query: Natural language search query
        category: Optional filter - "apps", "services", "blog", "company"
        response_format: "concise" or "detailed"

    Returns:
        KnowledgeResult with matching results or suggestions
    """
    all_results: list[SearchResultItem] = []

    # Search specified category or all
    if category is None or category == "apps":
        all_results.extend(_search_apps(query, response_format))
    if category is None or category == "services":
        all_results.extend(_search_services(query, response_format))
    if category is None or category == "blog":
        all_results.extend(_search_blog(query, response_format))
    if category is None or category == "company":
        all_results.extend(_search_company(query, response_format))

    # Sort by score and limit results
    all_results.sort(key=lambda x: x.score, reverse=True)
    top_results = all_results[:5]

    # Build result
    found = len(top_results) > 0
    suggestion = None if found else _get_suggestion(query, category)

    return KnowledgeResult(
        found=found,
        category=category or "all",
        results=top_results,
        suggestion=suggestion,
        query=query,
    )
```
- **VALIDATE**: `python -c "from features.knowledge.search import execute_search; print('Search OK')"`

---

### 8. CREATE agent/features/knowledge/tool.py

- **IMPLEMENT**: Pydantic AI tool definition with @agent.tool decorator
- **PATTERN**: From CLAUDE.md lines 158-178
- **CONTENT**:
```python
"""Pydantic AI tool for knowledge base search."""

from typing import Optional

from pydantic_ai import RunContext

from core.agent import agent
from .models import KnowledgeResult, CategoryType, ResponseFormat
from .search import execute_search


@agent.tool
async def search_knowledge_base(
    ctx: RunContext[None],
    query: str,
    category: Optional[CategoryType] = None,
    response_format: ResponseFormat = "concise",
) -> KnowledgeResult:
    """Search Siphio's knowledge base for accurate business information.

    Use this tool to find information about Siphio's products, services,
    blog content, and company details. ALWAYS use this tool instead of
    guessing or making up information about Siphio.

    Args:
        query: Natural language search query describing what to find
        category: Optional filter - "apps" for products, "services" for
                  consulting offerings, "blog" for articles, "company" for
                  mission and team info. Leave empty to search all.
        response_format: "concise" for brief answers (default),
                        "detailed" for comprehensive information

    Returns:
        KnowledgeResult containing matching results or suggestions
    """
    return await execute_search(query, category, response_format)
```
- **GOTCHA**: Import `agent` from `core.agent` to register the tool
- **VALIDATE**: `python -c "from features.knowledge.tool import search_knowledge_base; print('Tool OK')"`

---

### 9. CREATE agent/features/knowledge/__init__.py

- **IMPLEMENT**: Slice exports
- **CONTENT**:
```python
"""Knowledge search feature slice.

Provides the search_knowledge_base tool for the AI agent to query
Siphio's business information from structured JSON files.
"""

from .tool import search_knowledge_base
from .models import KnowledgeResult, SearchResultItem
from .search import execute_search

__all__ = [
    "search_knowledge_base",
    "KnowledgeResult",
    "SearchResultItem",
    "execute_search",
]
```
- **VALIDATE**: `python -c "from features.knowledge import search_knowledge_base; print('Slice OK')"`

---

### 10. UPDATE agent/core/agent.py

- **IMPLEMENT**: Import knowledge tool to register it with agent
- **ADD** (after line 28):
```python

# Register tools from feature slices
# Tool registration happens via @agent.tool decorator when imported
from features.knowledge import search_knowledge_base  # noqa: F401
```
- **GOTCHA**: The import must happen AFTER agent is created
- **VALIDATE**: `python -c "from core.agent import agent; print(f'Tools: {len(agent._tools)}')"` should show 1+

---

### 11. UPDATE agent/core/prompts.py

- **IMPLEMENT**: Add tool usage instructions to system prompt
- **REPLACE** entire SYSTEM_PROMPT with:
```python
"""System prompts for Siphio AI Agent."""

SYSTEM_PROMPT = """You are Siphio's AI Assistant, an intelligent helper on the Siphio AI website.

## Your Identity
- You represent Siphio AI, a company that builds AI-native software
- You are professional, friendly, and helpful
- You provide accurate information about Siphio's products and services

## Your Tools

### search_knowledge_base
Use this tool to find accurate information about Siphio. ALWAYS use this tool before answering questions about:
- Our apps (Spending Insights, Checklist Manager, AI Agents)
- Our services (AI development, consulting, full-stack development)
- Our blog posts and articles
- Company information (mission, team, technology, values)

**When to use**:
- User asks "What is Spending Insights?" → Search with query="Spending Insights", category="apps"
- User asks "What services do you offer?" → Search with category="services"
- User asks about pricing → Search with query="pricing", category="services"
- User asks about your tech stack → Search with query="technology", category="company"

**Response format**:
- Use "concise" (default) for quick answers
- Use "detailed" when user wants comprehensive information

## Your Boundaries
- Only discuss topics related to Siphio and its offerings
- NEVER make up information - use the search tool to find accurate data
- If the search returns no results, honestly say you don't have that information
- Politely redirect off-topic conversations back to how you can help with Siphio

## Communication Style
- Be concise and clear
- Use a warm but professional tone
- Present search results naturally, not as raw data dumps
- Ask clarifying questions when needed
- Admit limitations honestly
"""
```
- **VALIDATE**: `python -c "from core.prompts import SYSTEM_PROMPT; print('search_knowledge_base' in SYSTEM_PROMPT)"`

---

### 12. UPDATE agent/main.py

- **IMPLEMENT**: Update chat endpoint to return tools_called from result
- **REPLACE** lines 76-91 with:
```python
    try:
        # Run agent with message
        # Note: message_history integration will be enhanced in later phases
        result = await agent.run(request.message)

        # Build response
        usage = result.usage()

        # Extract tool names from tool calls
        tools_called = []
        for call in result.all_messages():
            if hasattr(call, 'parts'):
                for part in call.parts:
                    if hasattr(part, 'tool_name'):
                        tools_called.append(part.tool_name)

        return ChatResponse(
            response=result.output,
            tokens_used=usage.total_tokens if usage else 0,
            tools_called=tools_called,
        )
    except Exception as e:
        # Log error in production
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
```
- **VALIDATE**: Server starts and `/chat` returns `tools_called` array

---

## TESTING STRATEGY

### Manual Testing (Phase 2)

1. **Data Loading Test**
```bash
cd agent
python -c "
from features.knowledge.search import _load_data
data = _load_data()
print(f'Loaded categories: {list(data.keys())}')
print(f'Apps: {len(data.get(\"apps\", {}).get(\"apps\", []))}')
print(f'Blog posts: {len(data.get(\"blog\", {}).get(\"posts\", []))}')
"
```

2. **Search Function Test**
```bash
cd agent
python -c "
import asyncio
from features.knowledge.search import execute_search

async def test():
    result = await execute_search('Spending Insights')
    print(f'Found: {result.found}, Results: {len(result.results)}')
    if result.results:
        print(f'Top result: {result.results[0].title}')

asyncio.run(test())
"
```

3. **Tool Registration Test**
```bash
cd agent
python -c "
from core.agent import agent
print(f'Agent tools: {[t.name for t in agent._tools]}')
"
```

4. **API Endpoint Test**
```bash
# Start server
cd agent && python -m uvicorn main:app --port 8000 &

# Test knowledge query
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Spending Insights?"}'
```

### Expected Results

- Apps query returns results with app details
- Services query includes pricing information
- Blog search finds relevant posts
- Company query returns mission and values
- `tools_called` includes "search_knowledge_base" when tool is used

---

## VALIDATION COMMANDS

Execute every command to ensure zero errors.

### Level 1: File Verification

```bash
cd agent
# Check all data files exist and are valid JSON
python -c "
import json
from pathlib import Path

data_dir = Path('features/knowledge/data')
files = ['apps.json', 'services.json', 'blog_index.json', 'company.json']
for f in files:
    path = data_dir / f
    assert path.exists(), f'{f} missing'
    json.load(open(path))
    print(f'{f} OK')
"
```

### Level 2: Import Verification

```bash
cd agent
python -c "from features.knowledge.models import KnowledgeResult; print('Models OK')"
python -c "from features.knowledge.search import execute_search; print('Search OK')"
python -c "from features.knowledge.tool import search_knowledge_base; print('Tool OK')"
python -c "from features.knowledge import search_knowledge_base; print('Slice OK')"
python -c "from core.agent import agent; print(f'Agent has {len(agent._tools)} tools')"
```

### Level 3: Search Functionality

```bash
cd agent
python -c "
import asyncio
from features.knowledge.search import execute_search

async def test_searches():
    # Test app search
    r = await execute_search('Spending Insights', category='apps')
    assert r.found, 'App search failed'
    print(f'Apps: {r.results[0].title}')

    # Test services search
    r = await execute_search('consulting', category='services')
    assert r.found, 'Services search failed'
    print(f'Services: {r.results[0].title}')

    # Test blog search
    r = await execute_search('AI-native', category='blog')
    assert r.found, 'Blog search failed'
    print(f'Blog: {r.results[0].title}')

    # Test company search
    r = await execute_search('mission', category='company')
    assert r.found, 'Company search failed'
    print(f'Company: {r.results[0].title}')

    print('All searches passed!')

asyncio.run(test_searches())
"
```

### Level 4: Server & API

```bash
# Start server in background
cd agent && python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
sleep 3

# Health check
curl -s http://localhost:8000/health

# Knowledge query
curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What apps does Siphio offer?"}'

# Kill server
pkill -f "uvicorn main:app"
```

---

## ACCEPTANCE CRITERIA

- [x] Directory structure follows Vertical Slice pattern
- [ ] All 4 JSON data files created and valid
- [ ] `models.py` defines KnowledgeResult and SearchResultItem
- [ ] `search.py` implements keyword + fuzzy matching
- [ ] `tool.py` registers tool with @agent.tool decorator
- [ ] `core/agent.py` imports tool to register it
- [ ] `core/prompts.py` updated with tool usage instructions
- [ ] `main.py` returns tools_called in response
- [ ] rapidfuzz added to requirements.txt
- [ ] App searches return correct results
- [ ] Services searches include pricing info
- [ ] Blog searches find relevant posts
- [ ] Company searches return mission/values
- [ ] No results returns helpful suggestions
- [ ] Agent uses tool when asked about Siphio products

---

## COMPLETION CHECKLIST

- [ ] All 12 tasks completed in order
- [ ] All data files valid JSON
- [ ] All Python imports work
- [ ] Search returns results for each category
- [ ] Tool registered with agent
- [ ] System prompt includes tool instructions
- [ ] API returns tools_called
- [ ] Manual API test shows tool usage
- [ ] No errors in console

---

## NOTES

### Design Decisions

1. **JSON vs Database**: Using JSON files for MVP simplicity. Easy to update, no infrastructure needed. Move to vector DB (pgvector) post-MVP for semantic search.

2. **Fuzzy Matching**: Using rapidfuzz for typo tolerance. `partial_ratio` handles substring matches well. Threshold of 60 balances recall vs precision.

3. **Category Filtering**: Optional category parameter reduces search scope and improves relevance. Agent can search all categories when unsure.

4. **Response Formats**: "concise" (default) saves tokens for quick answers. "detailed" provides comprehensive info when user asks for specifics.

5. **Score-Based Ranking**: Results sorted by match score, limited to top 5. Prevents overwhelming responses.

### Data Considerations

- **Apps Data**: Manually convert from TypeScript, adding `features` array for better searchability
- **Blog Index**: Extract key topics for each post to improve search matching
- **Services**: New data not in frontend, defines consulting offerings and pricing approach
- **Company**: New data consolidating company info, tech stack, and values

### Future Enhancements (Not Phase 2)

- Semantic search with embeddings (Phase 4+)
- Auto-sync blog.ts changes to blog_index.json
- App update notifications
- Search analytics and query logging
