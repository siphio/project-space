# Product Requirements Document: Siphio's Assistant

## 1. Executive Summary

Siphio's Assistant is an AI-powered conversational agent embedded as a chat widget on the Siphio AI landing page. The agent serves as the primary point of contact for visitors seeking information about Siphio's products (Spending Insights, Macros Tracker), freelancing services, and AI development capabilities.

The assistant operates with a professional tone, answering business-related questions by querying a structured knowledge base through purpose-built tools. It intelligently distinguishes between simple informational queries (which require no follow-up) and potential business opportunities (which trigger a lead capture flow). When a conversation indicates genuine interest in services, the agent guides users through providing their contact information, generates a conversation summary, and stores the lead in Supabase for team follow-up.

**MVP Goal:** Deploy a functional AI chat assistant that accurately answers questions about Siphio's business, checks real-time API statuses, and captures qualified leads with conversation context for team review.

---

## 2. Mission

**Mission Statement:** Provide every Siphio website visitor with instant, accurate answers about our products and services while intelligently identifying and capturing business opportunities for human follow-up.

**Core Principles:**

1. **Accuracy Over Fabrication** - The agent only provides information from its knowledge base; it never hallucinates business details
2. **Intelligent Engagement** - Distinguish between casual inquiries and genuine business interest to avoid unnecessary friction
3. **Respect User Time** - Provide concise, relevant answers; only initiate lead capture when appropriate
4. **Professional Representation** - Embody Siphio's brand as knowledgeable, helpful, and trustworthy
5. **Privacy-Conscious** - Only collect personal information when there's clear value exchange for the user

**Architectural Principle:**

6. **Vertical Slice Architecture** - Code is organized by feature/capability, not by technical layer. Every feature is self-contained, making the codebase easy to navigate, understand, and modify. This is non-negotiable for maintainability.

---

## 3. Target Users

### Primary Persona: Potential Client
- **Who:** Business owners, startup founders, product managers seeking AI/automation solutions
- **Technical Level:** Varies from non-technical to technical decision-makers
- **Needs:** Understand what Siphio offers, evaluate fit for their project, connect with the team
- **Pain Points:** Don't want to fill out generic contact forms, want quick answers before committing to a call

### Secondary Persona: Product Explorer
- **Who:** Users interested in Siphio's apps (Spending Insights, Macros Tracker)
- **Technical Level:** End users, not necessarily technical
- **Needs:** Learn about app features, check if services are operational, read about updates
- **Pain Points:** Want quick answers without digging through documentation

### Tertiary Persona: Technical Researcher
- **Who:** Developers, technical evaluators researching Siphio's tech stack and approach
- **Technical Level:** High
- **Needs:** Understand technologies used, architectural approach, API availability
- **Pain Points:** Want specific technical details, not marketing fluff

---

## 4. MVP Scope

### In Scope

**Core Functionality:**
- ✅ Chat widget accessible from landing page bottom
- ✅ Natural conversation flow with context maintained within session
- ✅ Answer questions about Siphio apps (Spending Insights, Macros Tracker, AI Agents)
- ✅ Answer questions about freelancing services and capabilities
- ✅ Answer questions about blog content with ability to quote/summarize
- ✅ Answer questions about technologies and tech stack
- ✅ Real-time API status checks for Siphio services
- ✅ Intelligent lead capture flow when business interest detected
- ✅ Conversation summary generation for team handoff
- ✅ Rate limiting based on token usage per session

**Technical:**
- ✅ **Vertical Slice Architecture** - Features organized by capability, not layer
- ✅ Pydantic AI agent framework (Python/FastAPI backend)
- ✅ Next.js frontend integration via API endpoints
- ✅ Supabase local development (CLI) for lead storage
- ✅ JSON-based knowledge files for business information
- ✅ Tool-based architecture (3 high-impact tools as vertical slices)
- ✅ Session-based conversation context (no cross-session persistence)

**Security:**
- ✅ Token-based rate limiting per chat session
- ✅ Bad actor detection and disengagement
- ✅ Scope boundaries (only answers Siphio-related questions)

### Out of Scope

**Deferred Features:**
- ❌ Real-time human handoff (team reviews leads asynchronously)
- ❌ User authentication/accounts
- ❌ Cross-session conversation memory
- ❌ Admin dashboard for knowledge base updates
- ❌ Multi-language support
- ❌ Voice interaction
- ❌ Proactive chat initiation (user must open widget)
- ❌ Integration with CRM systems
- ❌ Analytics dashboard for chat metrics

**Technical Deferrals:**
- ❌ Cloud deployment (local development only for MVP)
- ❌ Vector database/RAG for semantic search
- ❌ Automated blog sync (manual updates to blog_index.json)

---

## 5. User Stories

### Primary User Stories

**US-1: Learn About Apps**
> As a potential user, I want to ask about Siphio's apps and their features, so that I can understand if they solve my problem.

*Example:* "What does Spending Insights do?" → Agent queries knowledge base, returns concise app description with key features.

**US-2: Understand Services**
> As a business owner, I want to learn about Siphio's freelancing services, so that I can evaluate if they can help with my project.

*Example:* "Do you build custom AI agents?" → Agent returns service details, asks clarifying questions about their needs.

**US-3: Check Service Status**
> As a current user, I want to check if Siphio's services are operational, so that I know if an issue is on my end or theirs.

*Example:* "Is Spending Insights down?" → Agent checks real-time status, reports current state.

**US-4: Explore Blog Content**
> As a researcher, I want to ask about Siphio's blog posts, so that I can find relevant articles without searching manually.

*Example:* "Do you have any posts about AI-native applications?" → Agent searches blog index, returns relevant post summaries.

**US-5: Connect with Team**
> As a potential client with a project idea, I want to describe my needs and connect with the Siphio team, so that I can explore working together.

*Example:* User describes their automation needs → Agent gathers requirements, offers to pass conversation to team, collects name/email, generates summary, saves lead.

**US-6: Quick Question Resolution**
> As a casual visitor, I want to ask a simple question and get an answer without being asked for my contact info, so that I don't feel pressured.

*Example:* "What tech stack do you use?" → Agent answers directly, no lead capture initiated.

### Technical User Stories

**US-7: Rate Limited Sessions**
> As the Siphio team, I want chat sessions to be token-limited, so that we control API costs and prevent abuse.

**US-8: Bad Actor Protection**
> As the Siphio team, I want the agent to detect and disengage from spam/abuse, so that resources aren't wasted on bad actors.

---

## 6. Core Architecture & Patterns

### Architectural Philosophy: Vertical Slice Architecture

**This project strictly follows Vertical Slice Architecture (VSA)** - code is organized by feature/capability, not by technical layer. This is a fundamental design decision that prioritizes developer experience and codebase navigability.

#### Why Vertical Slice Architecture?

**Traditional Layered Architecture (What We Avoid):**
```
# BAD - Organized by technical layer
agent/
├── controllers/          # All request handlers
│   ├── chat_controller.py
│   └── status_controller.py
├── services/             # All business logic
│   ├── knowledge_service.py
│   ├── status_service.py
│   └── lead_service.py
├── repositories/         # All data access
│   ├── knowledge_repo.py
│   └── lead_repo.py
└── models/               # All data models
    ├── knowledge_models.py
    └── lead_models.py

# Problem: To understand "knowledge search", you must look in 4+ different folders
```

**Vertical Slice Architecture (What We Use):**
```
# GOOD - Organized by feature/capability
agent/
├── features/
│   ├── knowledge/           # Everything for knowledge search
│   │   ├── tool.py          # Tool definition
│   │   ├── search.py        # Search logic
│   │   ├── models.py        # Knowledge-specific models
│   │   └── data/            # Knowledge JSON files
│   │       ├── apps.json
│   │       ├── services.json
│   │       └── ...
│   ├── status/              # Everything for status checks
│   │   ├── tool.py
│   │   ├── health_check.py
│   │   └── models.py
│   └── leads/               # Everything for lead capture
│       ├── tool.py
│       ├── capture.py
│       ├── models.py
│       └── validation.py
└── core/                    # Truly shared infrastructure
    ├── agent.py
    ├── config.py
    └── prompts.py

# Benefit: To understand "knowledge search", look in ONE folder
```

#### Vertical Slice Principles

1. **Feature Cohesion** - All code for a feature lives together. Models, logic, data, and tool definitions in one place.

2. **Minimal Shared Code** - Only genuinely cross-cutting concerns go in `core/`. When in doubt, duplicate rather than create premature abstractions.

3. **Independent Slices** - Each feature can be understood, modified, or deleted without understanding the entire system.

4. **Navigate by Capability** - Ask "where is the lead capture code?" Answer: `features/leads/`. No hunting across layers.

5. **Scale by Adding Slices** - New features = new folders. Existing features remain untouched.

#### Benefits for This Project

| Benefit | How It Helps |
|---------|--------------|
| **Onboarding** | New developers understand features in isolation |
| **Debugging** | Issues are contained within feature boundaries |
| **Testing** | Each slice can be tested independently |
| **Modification** | Change one feature without fear of breaking others |
| **Deletion** | Remove a feature by deleting its folder |
| **Code Review** | PRs are scoped to specific features |

---

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Chat Widget Component                 │    │
│  │  - Message display                                       │    │
│  │  - Input handling                                        │    │
│  │  - Session management                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js API Route (/api/chat)               │    │
│  │  - Request validation                                    │    │
│  │  - Session token tracking                                │    │
│  │  - Rate limiting                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                    Python FastAPI Backend                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Pydantic AI Agent                      │    │
│  │  - System prompt (identity, boundaries)                  │    │
│  │  - Conversation context management                       │    │
│  │  - Tool orchestration                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐              │
│         ▼                    ▼                    ▼              │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐        │
│  │  Tool:      │    │  Tool:       │    │  Tool:       │        │
│  │  search_    │    │  check_      │    │  capture_    │        │
│  │  knowledge  │    │  service_    │    │  lead        │        │
│  │  _base      │    │  status      │    │              │        │
│  └─────────────┘    └──────────────┘    └──────────────┘        │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐        │
│  │ JSON Files  │    │ HTTP Health  │    │   Supabase   │        │
│  │ (knowledge) │    │   Checks     │    │   (leads)    │        │
│  └─────────────┘    └──────────────┘    └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure (Vertical Slice)

```
webapp-test/
├── src/                                    # Next.js Frontend
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts                # Chat endpoint (proxies to Python)
│   │   └── ...
│   └── components/
│       └── blocks/
│           └── chat-widget.tsx             # Chat UI component
│
├── agent/                                  # Python Backend (Vertical Slices)
│   │
│   ├── main.py                             # FastAPI entry point (thin)
│   ├── requirements.txt                    # Python dependencies
│   │
│   ├── core/                               # Shared infrastructure ONLY
│   │   ├── __init__.py
│   │   ├── agent.py                        # Pydantic AI agent setup
│   │   ├── config.py                       # Environment & settings
│   │   └── prompts.py                      # System prompt definitions
│   │
│   ├── features/                           # VERTICAL SLICES - One folder per capability
│   │   │
│   │   ├── knowledge/                      # 🔍 SLICE: Knowledge Search
│   │   │   ├── __init__.py
│   │   │   ├── tool.py                     # Tool definition for agent
│   │   │   ├── search.py                   # Search logic & matching
│   │   │   ├── models.py                   # Knowledge-specific types
│   │   │   └── data/                       # Knowledge JSON files
│   │   │       ├── apps.json               # App catalog
│   │   │       ├── services.json           # Service offerings
│   │   │       ├── company.json            # Company info
│   │   │       └── blog_index.json         # Blog summaries
│   │   │
│   │   ├── status/                         # 📊 SLICE: Service Status
│   │   │   ├── __init__.py
│   │   │   ├── tool.py                     # Tool definition for agent
│   │   │   ├── health_check.py             # HTTP health check logic
│   │   │   ├── models.py                   # Status-specific types
│   │   │   └── endpoints.py                # Service endpoint configs
│   │   │
│   │   └── leads/                          # 📧 SLICE: Lead Capture
│   │       ├── __init__.py
│   │       ├── tool.py                     # Tool definition for agent
│   │       ├── capture.py                  # Lead capture logic
│   │       ├── models.py                   # Lead-specific types
│   │       ├── validation.py               # Email & input validation
│   │       └── supabase.py                 # Database operations
│   │
│   └── database/                           # Database setup (shared infrastructure)
│       ├── __init__.py
│       ├── client.py                       # Supabase client
│       └── migrations/
│           └── 001_create_leads.sql
```

#### Navigation Guide

| "I want to..." | "Look in..." |
|----------------|--------------|
| Understand knowledge search | `agent/features/knowledge/` |
| Modify status checks | `agent/features/status/` |
| Fix lead capture bug | `agent/features/leads/` |
| Change agent personality | `agent/core/prompts.py` |
| Add a new feature | Create `agent/features/new_feature/` |
| Update app descriptions | `agent/features/knowledge/data/apps.json` |

### Key Design Patterns

1. **Vertical Slice Architecture (PRIMARY)** - Code organized by feature, not layer. Each slice is self-contained with its own models, logic, and data. This is the foundational architectural decision.

2. **Tool-Based Knowledge Access** - Agent queries structured data through explicit tool calls rather than having everything in context. Each tool is a complete vertical slice.

3. **Session-Scoped Context** - Conversation history maintained per session, cleared on close

4. **Intelligent Routing** - Agent decides which tool to call based on user intent

5. **Graceful Degradation** - When tools fail or knowledge is missing, agent acknowledges limitations

6. **Token Budget Management** - Track and limit token usage per session

7. **Thin Entry Points** - `main.py` and API routes are minimal; real logic lives in feature slices

---

## 7. Tools/Features

### Tool 1: `search_knowledge_base`

**Purpose:** Unified search across all Siphio business information. Single entry point for apps, services, blog content, and company details.

**Operations:**
- Search app catalog (descriptions, features, tech stack, use cases)
- Search service offerings (freelancing, AI development, pricing approach)
- Search blog content (summaries, key topics, recommendations)
- Search company info (mission, team, technologies)
- Retrieve latest updates/changelogs for specific apps

**Parameters:**
```python
query: str              # Natural language query
category: Optional[str] # "apps" | "services" | "blog" | "company" | None (searches all)
response_format: str    # "concise" | "detailed" (default: "concise")
```

**Returns:**
```python
{
    "found": bool,
    "category": str,
    "results": [
        {
            "title": str,
            "content": str,
            "relevance": str,  # Why this result matches
            "source": str      # Where this info comes from
        }
    ],
    "suggestion": Optional[str]  # If no results, suggest alternatives
}
```

**Key Features:**
- Keyword and fuzzy matching across knowledge files
- Category filtering for targeted searches
- Response format toggle for token efficiency
- Helpful suggestions when no matches found

---

### Tool 2: `check_service_status`

**Purpose:** Real-time health checks for all Siphio services and their subsystems.

**Operations:**
- Check individual service status
- Check all services at once
- Report AI chat subsystem status
- Include recent incidents if any

**Parameters:**
```python
service: Optional[str]  # "spending-insights" | "macros-tracker" | "ai-agent" | None (all)
```

**Returns:**
```python
{
    "timestamp": str,
    "services": [
        {
            "name": str,
            "status": str,           # "operational" | "degraded" | "down" | "unknown"
            "ai_subsystem": str,     # Status of AI features specifically
            "last_checked": str,
            "recent_incidents": []   # Any recent issues
        }
    ],
    "overall_status": str  # Summary status
}
```

**Key Features:**
- Async health checks to actual endpoints (scaffolded for MVP)
- Caching to prevent excessive health check calls
- Clear status reporting with timestamps

---

### Tool 3: `capture_lead`

**Purpose:** Handle the complete lead capture flow - validate information, store in Supabase, confirm to user.

**Operations:**
- Validate name and email format
- Generate conversation summary (if not provided)
- Classify inquiry type
- Store lead in Supabase
- Return confirmation with reference ID

**Parameters:**
```python
name: str                    # User's name
email: str                   # User's email (validated)
conversation_summary: str    # Agent-generated summary of the conversation
inquiry_type: str            # "freelance_project" | "app_question" | "partnership" | "other"
```

**Returns:**
```python
{
    "success": bool,
    "reference_id": str,      # For user reference
    "message": str,           # Confirmation message
    "error": Optional[str]    # If validation failed
}
```

**Key Features:**
- Email format validation
- Duplicate detection (same email within 24 hours)
- Structured data storage for easy team review
- Clear confirmation messaging

---

## 8. Technology Stack

### Backend (Python Agent Service)

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| Pydantic AI | Latest | Agent framework |
| FastAPI | 0.100+ | API server |
| OpenRouter | - | LLM API gateway |
| Grok 4.1 Fast | x-ai/grok-4.1-fast | LLM model (via OpenRouter) |
| supabase-py | Latest | Database client |
| uvicorn | Latest | ASGI server |
| python-dotenv | Latest | Environment management |

### Why Grok 4.1 Fast via OpenRouter?

| Benefit | Details |
|---------|---------|
| **Agentic Tool Calling** | Purpose-built for tool use - xAI's best model for agent workflows |
| **2M Context Window** | Massive context for long conversations without truncation |
| **Cost Effective** | $0.20/M input tokens, $0.50/M output tokens |
| **OpenRouter Flexibility** | Easy model switching if needed (Claude, GPT, Gemini available) |
| **Native Pydantic AI Support** | First-class `OpenRouterModel` integration |

**Model ID:** `x-ai/grok-4.1-fast`

### Frontend (Next.js)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | Framework (existing) |
| React | 19.2.3 | UI library (existing) |
| TypeScript | 5 | Type safety (existing) |
| Tailwind CSS | 4 | Styling (existing) |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Supabase CLI | Local database development |
| PostgreSQL | Database (via Supabase) |

### Dependencies (Python)

```
pydantic-ai-slim[openrouter]>=0.0.1
fastapi>=0.100.0
uvicorn>=0.23.0
supabase>=2.0.0
python-dotenv>=1.0.0
httpx>=0.25.0
```

### Pydantic AI + OpenRouter Setup

```python
# Basic usage - set OPENROUTER_API_KEY env var
from pydantic_ai import Agent

agent = Agent('openrouter:x-ai/grok-4.1-fast')

# Or explicit configuration
from pydantic_ai.models.openrouter import OpenRouterModel
from pydantic_ai.providers.openrouter import OpenRouterProvider

model = OpenRouterModel(
    'x-ai/grok-4.1-fast',
    provider=OpenRouterProvider(
        api_key='your-openrouter-api-key',
        app_title='Siphio Assistant',
    ),
)
agent = Agent(model)
```

---

## 9. Security & Configuration

### Configuration Management

**Environment Variables:**
```bash
# Python Agent (.env)
OPENROUTER_API_KEY=sk-or-...              # OpenRouter API key
OPENROUTER_MODEL=x-ai/grok-4.1-fast       # Model identifier
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=...
AGENT_PORT=8000
MAX_TOKENS_PER_SESSION=8000
RATE_LIMIT_WINDOW_SECONDS=3600

# Next.js (.env.local)
AGENT_API_URL=http://localhost:8000
```

**Get OpenRouter API Key:** https://openrouter.ai/keys

### Security Scope

**In Scope (MVP):**
- ✅ Token-based rate limiting per session
- ✅ Email format validation
- ✅ Input sanitization
- ✅ Scope boundary enforcement (Siphio topics only)
- ✅ Bad actor detection (prompt injection, spam patterns)
- ✅ CORS configuration for API endpoints

**Out of Scope (MVP):**
- ❌ User authentication
- ❌ API key management for external users
- ❌ Audit logging
- ❌ Data encryption at rest
- ❌ GDPR compliance features

### Rate Limiting Strategy

```python
# Per-session limits
MAX_TOKENS_PER_SESSION = 8000      # Total tokens (input + output)
MAX_MESSAGES_PER_SESSION = 50       # Message count limit
COOLDOWN_ON_LIMIT = 300             # 5 minute cooldown if limit hit
```

---

## 10. API Specification

### Chat Endpoint (Next.js → Python Agent)

**POST** `/api/chat`

**Request:**
```json
{
    "session_id": "uuid-string",
    "message": "What does Spending Insights do?",
    "conversation_history": [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello! I'm Siphio's Assistant..."}
    ]
}
```

**Response:**
```json
{
    "response": "Spending Insights is an AI-powered financial analytics app...",
    "session_id": "uuid-string",
    "tokens_used": 245,
    "tokens_remaining": 7755,
    "tools_called": ["search_knowledge_base"],
    "lead_captured": false
}
```

**Error Response:**
```json
{
    "error": "rate_limit_exceeded",
    "message": "You've reached the conversation limit. Please try again in 5 minutes.",
    "retry_after": 300
}
```

### Python Agent Internal Endpoint

**POST** `/chat`

**Request:**
```json
{
    "message": "string",
    "conversation_history": [],
    "session_metadata": {
        "tokens_used": 0,
        "session_start": "ISO timestamp"
    }
}
```

**Response:**
```json
{
    "response": "string",
    "tokens_used": 245,
    "tools_called": ["tool_name"],
    "should_capture_lead": false
}
```

---

## 11. Success Criteria

### MVP Success Definition

The MVP is successful when:
1. A user can open the chat widget and have a natural conversation about Siphio
2. The agent accurately answers questions using knowledge base data (not hallucinations)
3. The agent correctly identifies lead opportunities and captures contact info
4. Leads appear in Supabase with conversation summaries
5. Rate limiting prevents abuse without impacting legitimate users

### Functional Requirements

- ✅ Chat widget renders and opens on landing page
- ✅ Messages send and receive within 3 seconds
- ✅ Agent uses tools to fetch information (visible in logs)
- ✅ Knowledge queries return accurate, sourced information
- ✅ Service status checks return real-time data
- ✅ Lead capture flow collects name, email, summary
- ✅ Leads persist in Supabase database
- ✅ Session context maintained throughout conversation
- ✅ Rate limits enforced per session
- ✅ Out-of-scope questions handled gracefully

### Quality Indicators

- Response latency < 3 seconds (p95)
- Knowledge accuracy > 95% (answers match source data)
- Lead capture completion rate > 80% (once initiated)
- Zero hallucinated business information

---

## 12. Implementation Phases

### Phase 1: Foundation
**Goal:** Set up Python agent infrastructure with Vertical Slice Architecture

**Deliverables:**
- ✅ Vertical Slice directory structure (`core/`, `features/`, `database/`)
- ✅ Python project with FastAPI (thin entry point in `main.py`)
- ✅ Core infrastructure (`core/agent.py`, `core/config.py`, `core/prompts.py`)
- ✅ Pydantic AI agent with system prompt
- ✅ Basic chat endpoint (no tools yet)
- ✅ Environment configuration
- ✅ Local development setup instructions

**Validation:** Send a message, receive a response from Claude via the agent. Directory structure follows VSA pattern.

---

### Phase 2: Knowledge Slice
**Goal:** Implement the knowledge feature as a complete vertical slice

**Deliverables:**
- ✅ Create `features/knowledge/` slice directory
- ✅ Knowledge data files (`data/apps.json`, `data/services.json`, `data/company.json`, `data/blog_index.json`)
- ✅ `features/knowledge/tool.py` - Tool definition for agent
- ✅ `features/knowledge/search.py` - Search logic & matching
- ✅ `features/knowledge/models.py` - Knowledge-specific types
- ✅ Response formatting (concise/detailed modes)

**Validation:** Ask "What is Spending Insights?" and receive accurate, sourced answer. All knowledge code lives in one folder.

---

### Phase 3: Status & Leads Slices
**Goal:** Implement remaining features as vertical slices with database integration

**Deliverables:**
- ✅ Create `features/status/` slice directory
  - `tool.py`, `health_check.py`, `models.py`, `endpoints.py`
- ✅ Create `features/leads/` slice directory
  - `tool.py`, `capture.py`, `models.py`, `validation.py`, `supabase.py`
- ✅ Shared `database/` setup (Supabase client, migrations)
- ✅ Supabase local setup with leads table
- ✅ Rate limiting implementation (in `core/`)

**Validation:** Complete a lead capture flow, verify lead appears in Supabase. Status and leads code isolated in respective slices.

---

### Phase 4: Frontend Integration
**Goal:** Connect chat widget to Python agent

**Deliverables:**
- ✅ Chat widget component (UI)
- ✅ Next.js API route proxying to Python agent
- ✅ Session management in frontend
- ✅ Token usage display
- ✅ Error handling and rate limit messaging

**Validation:** End-to-end conversation flow working in browser

---

## 13. Future Considerations

### Post-MVP Enhancements

**Knowledge & Intelligence:**
- Vector search (pgvector) for semantic blog search
- Automated blog sync from blog.ts to knowledge base
- Learning from conversations to improve responses
- Multi-turn clarification for complex queries

**User Experience:**
- Proactive chat triggers based on page behavior
- Quick reply buttons for common questions
- Typing indicators and read receipts
- Mobile-optimized chat widget

**Operations:**
- Admin dashboard for lead review
- Knowledge base CMS (update without code)
- Analytics dashboard (popular questions, conversion rates)
- A/B testing for prompts and flows

**Integrations:**
- Slack notifications for new leads
- Calendar integration for meeting scheduling
- CRM sync (HubSpot, Salesforce)
- Email follow-up automation

---

## 14. Risks & Mitigations

### Risk 1: Hallucinated Business Information
**Impact:** High - could mislead customers, damage trust
**Mitigation:**
- All business info comes from tool calls to knowledge files
- System prompt explicitly forbids making up information
- Regular testing with known questions

### Risk 2: API Cost Overruns
**Impact:** Medium - unexpected bills from abuse
**Mitigation:**
- Token-based rate limiting per session
- OpenRouter dashboard spending limits and alerts
- Bad actor detection and blocking
- Grok 4.1 Fast's competitive pricing ($0.20/M input) reduces exposure

### Risk 3: Lead Quality Issues
**Impact:** Medium - team wastes time on spam leads
**Mitigation:**
- Email validation before storage
- Conversation summary helps team quickly assess quality
- Duplicate detection within 24-hour window

### Risk 4: Latency Issues
**Impact:** Medium - poor user experience
**Mitigation:**
- Async tool calls where possible
- Response streaming (if supported)
- Timeout handling with graceful fallbacks

### Risk 5: Scope Creep During Development
**Impact:** Medium - delayed launch
**Mitigation:**
- Clear MVP scope definition (this document)
- Phase-based implementation
- "Out of Scope" features explicitly listed

---

## 15. Appendix

### Related Documents
- Pydantic AI Documentation: https://ai.pydantic.dev/
- Pydantic AI OpenRouter Guide: https://ai.pydantic.dev/models/openrouter/
- OpenRouter Documentation: https://openrouter.ai/docs
- Grok 4.1 Fast on OpenRouter: https://openrouter.ai/x-ai/grok-4.1-fast
- xAI Grok 4.1 Fast Announcement: https://x.ai/news/grok-4-1-fast
- Supabase CLI Guide: https://supabase.com/docs/guides/cli

### Key Dependencies
- [Pydantic AI](https://github.com/pydantic/pydantic-ai) - Agent framework with native OpenRouter support
- [OpenRouter](https://openrouter.ai/) - LLM API gateway (access to Grok, Claude, GPT, etc.)
- [Grok 4.1 Fast](https://openrouter.ai/x-ai/grok-4.1-fast) - xAI's agentic tool-calling model
- [FastAPI](https://fastapi.tiangolo.com/) - Python API framework
- [Supabase](https://supabase.com/) - Database and auth platform

### Existing Codebase References
- App data: `src/data/apps.ts`
- Blog data: `src/data/blog.ts`
- Current API routes: `src/app/api/`
