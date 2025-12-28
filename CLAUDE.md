# Siphio AI - Global Development Rules

## 1. Core Principles

1. **Vertical Slice Architecture** - Code organized by feature, not layer. All code for a feature lives in one folder.
2. **Type Safety First** - TypeScript strict mode (frontend), Pydantic models (backend). No `any` types.
3. **Tool-Based Agent Design** - AI agent uses explicit tool calls to access data. Never rely on training data for business info.
4. **Local-First Development** - Supabase CLI for database, all services run locally before cloud deployment.
5. **Minimal Shared Code** - Duplicate rather than create premature abstractions. Only truly cross-cutting concerns go in `core/`.

---

## 2. Tech Stack

### Frontend (Next.js)
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | App Router framework |
| React | 19.2.3 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | - | Component primitives (Radix UI) |
| Lucide React | - | Icons |

### Backend (Python Agent)
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| Pydantic AI | Latest | Agent framework |
| FastAPI | 0.100+ | API server |
| OpenRouter | - | LLM gateway |
| Grok 4.1 Fast | x-ai/grok-4.1-fast | LLM model |
| supabase-py | Latest | Database client |
| uvicorn | Latest | ASGI server |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Supabase CLI | Local PostgreSQL + Auth + Storage |
| Docker | Required for Supabase CLI |

---

## 3. Architecture

### Directory Structure
```
webapp-test/
├── src/                          # Next.js Frontend
│   ├── app/                      # App Router pages
│   │   ├── api/                  # API routes
│   │   └── (pages)/              # Page routes
│   ├── components/
│   │   ├── blocks/               # Page sections (Hero, Navbar, etc.)
│   │   ├── ui/                   # shadcn primitives
│   │   └── aceternity/           # Aceternity UI components
│   ├── data/                     # Static data (apps.ts, blog.ts)
│   └── lib/                      # Utilities (utils.ts)
│
├── agent/                        # Python Backend (VERTICAL SLICES)
│   ├── main.py                   # FastAPI entry (thin)
│   ├── requirements.txt
│   ├── core/                     # Shared infrastructure ONLY
│   │   ├── agent.py              # Pydantic AI setup
│   │   ├── config.py             # Environment/settings
│   │   └── prompts.py            # System prompts
│   ├── features/                 # VERTICAL SLICES
│   │   ├── knowledge/            # Knowledge search slice
│   │   ├── status/               # Service status slice
│   │   └── leads/                # Lead capture slice
│   └── database/                 # Supabase setup
│       ├── client.py
│       └── migrations/
│
├── supabase/                     # Supabase CLI config
│   ├── config.toml
│   └── migrations/
```

### Vertical Slice Pattern
Each feature contains ALL its code:
```
features/knowledge/
├── __init__.py
├── tool.py           # Pydantic AI tool definition
├── search.py         # Business logic
├── models.py         # Feature-specific types
└── data/             # JSON knowledge files
```

**Rule:** To understand a feature, look in ONE folder. No hunting across layers.

---

## 4. Code Style

### Frontend (TypeScript/React)

**Component Naming:**
```tsx
// File: src/components/blocks/hero-section.tsx
// PascalCase for components, kebab-case for files

interface HeroSectionProps {
  heading?: string;
  description?: string;
  className?: string;
}

const HeroSection = ({
  heading = "Default Heading",
  description = "Default description",
  className,
}: HeroSectionProps) => {
  return (
    <section className={cn("py-16", className)}>
      <h1>{heading}</h1>
      <p>{description}</p>
    </section>
  );
};

export { HeroSection };
```

**Imports Order:**
```tsx
// 1. React/Next
import { useState } from "react";
import Link from "next/link";

// 2. External libraries
import { Star } from "lucide-react";

// 3. Internal utilities
import { cn } from "@/lib/utils";

// 4. Internal components
import { Button } from "@/components/ui/button";
```

### Backend (Python)

**Tool Definition:**
```python
# features/knowledge/tool.py
from pydantic_ai import Agent
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
    """Search Siphio's knowledge base for business information.

    Args:
        query: Natural language search query
        category: Filter by "apps", "services", "blog", or "company"
        response_format: "concise" or "detailed"

    Returns:
        KnowledgeResult with matching information
    """
    # Implementation in search.py
    from .search import execute_search
    return await execute_search(query, category, response_format)
```

**Naming Conventions:**
- Functions: `snake_case` - `search_knowledge_base()`
- Classes: `PascalCase` - `KnowledgeResult`
- Constants: `UPPER_SNAKE` - `MAX_TOKENS_PER_SESSION`
- Files: `snake_case.py` - `health_check.py`

---

## 5. Pydantic AI Agent Setup

### Basic Agent Configuration
```python
# core/agent.py
from pydantic_ai import Agent
from pydantic_ai.models.openrouter import OpenRouterModel
from pydantic_ai.providers.openrouter import OpenRouterProvider
from .config import settings
from .prompts import SYSTEM_PROMPT

# Initialize provider
provider = OpenRouterProvider(
    api_key=settings.OPENROUTER_API_KEY,
    app_title="Siphio Assistant",
)

# Initialize model
model = OpenRouterModel(
    settings.OPENROUTER_MODEL,  # "x-ai/grok-4.1-fast"
    provider=provider,
)

# Create agent
agent = Agent(
    model,
    system_prompt=SYSTEM_PROMPT,
    retries=2,
)
```

### Registering Tools
```python
# core/agent.py (continued)
from features.knowledge.tool import search_knowledge_base
from features.status.tool import check_service_status
from features.leads.tool import capture_lead

# Tools are registered via decorators in their respective slices
# Import them to ensure registration
```

### Running the Agent
```python
# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from core.agent import agent

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[dict] = []

class ChatResponse(BaseModel):
    response: str
    tokens_used: int
    tools_called: list[str]

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = await agent.run(
        request.message,
        message_history=request.conversation_history,
    )
    return ChatResponse(
        response=result.data,
        tokens_used=result.usage().total_tokens,
        tools_called=[tc.tool_name for tc in result.tool_calls],
    )
```

---

## 6. Supabase CLI - Local Development

### Initial Setup
```bash
# Install Supabase CLI (Windows - use scoop or npm)
npm install -g supabase

# Initialize in project root
supabase init

# Start local Supabase (requires Docker)
supabase start
```

### Local URLs (after `supabase start`)
| Service | URL |
|---------|-----|
| Studio | http://localhost:54323 |
| API | http://localhost:54321 |
| DB | postgresql://postgres:postgres@localhost:54322/postgres |
| Inbucket (email) | http://localhost:54324 |

### Creating Migrations
```bash
# Create a new migration
supabase migration new create_leads_table

# Apply migrations locally
supabase db reset

# Generate types (TypeScript)
supabase gen types typescript --local > src/types/database.ts
```

### Migration Example
```sql
-- supabase/migrations/001_create_leads.sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    conversation_summary TEXT NOT NULL,
    inquiry_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

### Environment Variables
```bash
# .env (Python agent)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_KEY=<from supabase start output>

# Never commit .env to git!
```

### Python Client
```python
# database/client.py
from supabase import create_client
from core.config import settings

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY,
)
```

---

## 7. Testing

### Frontend (Next.js)
```bash
npm run lint          # ESLint
npm run build         # Type check + build
```

### Backend (Python)
```bash
# Install dev dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest agent/tests/ -v

# Test a specific slice
pytest agent/tests/features/knowledge/ -v
```

### Test Structure
```
agent/tests/
├── conftest.py           # Shared fixtures
├── features/
│   ├── knowledge/
│   │   └── test_search.py
│   ├── status/
│   │   └── test_health_check.py
│   └── leads/
│       └── test_capture.py
```

### Test Example
```python
# agent/tests/features/knowledge/test_search.py
import pytest
from features.knowledge.search import execute_search

@pytest.mark.asyncio
async def test_search_apps_returns_results():
    result = await execute_search("spending insights", category="apps")
    assert result.found is True
    assert len(result.results) > 0
    assert "Spending Insights" in result.results[0]["title"]

@pytest.mark.asyncio
async def test_search_unknown_returns_suggestion():
    result = await execute_search("xyz unknown query")
    assert result.found is False
    assert result.suggestion is not None
```

---

## 8. Development Commands

### Frontend
```bash
npm install           # Install dependencies
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run lint          # Run ESLint
```

### Backend
```bash
cd agent/

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run dev server
uvicorn main:app --reload --port 8000

# Run tests
pytest -v
```

### Supabase
```bash
supabase start        # Start local stack
supabase stop         # Stop local stack
supabase db reset     # Reset and run all migrations
supabase migration new <name>  # Create migration
supabase status       # Check running services
```

---

## 9. Environment Configuration

### Required Environment Variables

```bash
# agent/.env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=x-ai/grok-4.1-fast
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=...
AGENT_PORT=8000
MAX_TOKENS_PER_SESSION=8000

# .env.local (Next.js)
AGENT_API_URL=http://localhost:8000
```

### Config Management (Python)
```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    OPENROUTER_MODEL: str = "x-ai/grok-4.1-fast"
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    AGENT_PORT: int = 8000
    MAX_TOKENS_PER_SESSION: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 10. AI Coding Assistant Instructions

1. **Read this file first** - Always check CLAUDE.md before making changes
2. **Follow Vertical Slice Architecture** - New features go in `agent/features/<feature>/`, not scattered across layers
3. **Use Pydantic AI patterns** - Tools use `@agent.tool` decorator with typed returns
4. **Never hardcode business info** - Agent gets data from knowledge JSON files via tool calls
5. **Run linters before committing** - `npm run lint` (frontend), `ruff check` (backend)
6. **Test locally with Supabase CLI** - `supabase start` before database work
7. **Keep entry points thin** - `main.py` and API routes delegate to feature slices
8. **Prefer `cn()` for classNames** - Use the utility from `@/lib/utils` for Tailwind merging
9. **Type everything** - No `any` in TypeScript, use Pydantic models in Python
10. **Check PRD.md for requirements** - Located at `.agents/PRD.md` for full project context
11. **Use ARK MCP for task management** - Leverage ARK tools for structured task tracking and documentation queries

---

## 11. ARK MCP Server - Task Management & RAG

### Overview

ARK is an MCP (Model Context Protocol) server that provides two core capabilities:
1. **Task Management** - Structured task creation, tracking, and workflow management
2. **RAG Documentation Querying** - Semantic search across project documentation and knowledge bases

### Task Management

Use ARK's task management tools to maintain structured workflows during development sessions.

**Creating Tasks:**
```
Use ARK to create tasks when:
- Starting a new feature implementation
- Breaking down complex work into subtasks
- Tracking bugs or issues discovered during development
```

**Task Lifecycle:**
| Status | Description |
|--------|-------------|
| `pending` | Task created but not started |
| `in_progress` | Currently being worked on |
| `blocked` | Waiting on external dependency |
| `completed` | Task finished successfully |

**Best Practices:**
- Create tasks at the start of multi-step implementations
- Update task status as you progress through work
- Link related tasks when dependencies exist
- Mark tasks complete immediately upon finishing (don't batch)

### RAG Documentation Querying

ARK provides semantic search across indexed documentation, enabling context-aware answers from project docs.

**When to Use RAG Queries:**
- Looking up implementation patterns from PRD.md
- Finding specific technical requirements
- Searching for existing architecture decisions
- Querying blog content or knowledge base entries

**Query Examples:**
```
# Find requirements for a specific feature
"What are the requirements for lead capture?"

# Search for architectural decisions
"How should vertical slices be structured?"

# Look up tech stack details
"What LLM model does the agent use?"
```

**Indexed Documentation Sources:**
- `.agents/PRD.md` - Product requirements document
- `CLAUDE.md` - Development rules and conventions
- `agent/features/knowledge/data/` - Knowledge base JSON files
- `src/data/` - Frontend static data (apps.ts, blog.ts)

### Integration with Development Workflow

1. **Before starting work** - Query ARK for relevant requirements and context
2. **During implementation** - Create and update tasks to track progress
3. **When blocked** - Query documentation for patterns or solutions
4. **After completion** - Mark tasks complete and document any new decisions

### ARK MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `create_task` | Create a new task with title, description, and metadata |
| `update_task` | Update task status, add notes, or modify details |
| `list_tasks` | View current tasks filtered by status or project |
| `query_docs` | Semantic search across indexed documentation |
| `get_context` | Retrieve relevant context for a specific topic |
