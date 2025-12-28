# Feature: Phase 1 - Agent Foundation

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Set up the Python agent infrastructure with Vertical Slice Architecture. This establishes the foundation for Siphio's AI Assistant - a FastAPI backend with Pydantic AI agent using OpenRouter/Grok 4.1 Fast. Phase 1 creates the core structure without tools; tools are added in Phase 2-3.

## User Story

As a **developer on the Siphio team**
I want to **have a working Python agent foundation**
So that **I can build vertical slice features (knowledge, status, leads) on top of it**

## Problem Statement

The Siphio website needs an AI-powered chat assistant. Currently only the Next.js frontend exists. We need to establish the Python backend infrastructure that will power the AI agent.

## Solution Statement

Create a minimal FastAPI application with:
- Pydantic AI agent configured with OpenRouter + Grok 4.1 Fast
- Proper environment configuration using Pydantic Settings
- System prompt establishing the assistant's identity
- `/chat` endpoint accepting messages and returning AI responses
- CORS configuration for Next.js frontend integration
- Vertical Slice directory structure ready for Phase 2-3 features

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: Python backend (new), configuration
**Dependencies**: pydantic-ai-slim[openrouter], fastapi, uvicorn, pydantic-settings

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

- `.agents/PRD.md` (lines 719-745) - Phase 1 requirements and deliverables
- `.agents/PRD.md` (lines 489-564) - Technology stack specifications
- `CLAUDE.md` (lines 1-100) - Vertical Slice Architecture rules and naming conventions
- `CLAUDE.md` (lines 101-200) - Python code style, Pydantic AI setup patterns
- `.env.local` - Contains `open-router-grok-api-key` and `open-router-grok-model-name`
- `.gitignore` - Already ignores `.env*` files

### New Files to Create

```
agent/
├── main.py                    # FastAPI entry point
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (from .env.local values)
├── core/
│   ├── __init__.py           # Core module init
│   ├── config.py             # Pydantic Settings configuration
│   ├── prompts.py            # System prompt definitions
│   └── agent.py              # Pydantic AI agent setup
├── features/
│   └── __init__.py           # Features module init (empty for Phase 1)
└── database/
    └── __init__.py           # Database module init (empty for Phase 1)
```

### Relevant Documentation - READ BEFORE IMPLEMENTING

- [Pydantic AI OpenRouter Guide](https://ai.pydantic.dev/models/openrouter/)
  - Specific section: Model initialization and provider setup
  - Why: Shows exact imports and configuration for OpenRouterModel

- [Pydantic AI Message History](https://ai.pydantic.dev/message-history/)
  - Specific section: Multi-turn conversations with message_history
  - Why: Required for conversation context handling

- [FastAPI CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/)
  - Specific section: CORSMiddleware configuration
  - Why: Needed for Next.js frontend to call Python API

- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
  - Specific section: Environment variable loading
  - Why: Proper config management pattern

### Patterns to Follow

**File Naming (from CLAUDE.md):**
- Python files: `snake_case.py`
- Functions: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

**Environment Variable Naming:**
- Use `UPPER_SNAKE_CASE` (e.g., `OPENROUTER_API_KEY`)
- Current `.env.local` uses `kebab-case` - must be translated

**Import Order (from CLAUDE.md):**
```python
# 1. Standard library
from typing import Optional

# 2. Third-party
from fastapi import FastAPI
from pydantic import BaseModel

# 3. Local
from core.config import settings
```

**Thin Entry Points (from PRD):**
- `main.py` should be minimal - delegate logic to modules
- No business logic in `main.py`

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation Setup

Create directory structure and dependency file.

**Tasks:**
- Create `agent/` directory with subdirectories
- Create `requirements.txt` with exact dependencies

### Phase 2: Configuration Layer

Set up environment and configuration management.

**Tasks:**
- Create `agent/.env` with properly named variables
- Create `core/config.py` with Pydantic Settings class
- Update `.gitignore` for Python artifacts

### Phase 3: Agent Core

Configure Pydantic AI with OpenRouter.

**Tasks:**
- Create `core/prompts.py` with system prompt
- Create `core/agent.py` with agent initialization
- Create `core/__init__.py`

### Phase 4: API Layer

Create FastAPI application with chat endpoint.

**Tasks:**
- Create `main.py` with FastAPI app, CORS, and `/chat` endpoint
- Create placeholder `__init__.py` files for features and database

---

## STEP-BY-STEP TASKS

### 1. CREATE agent/requirements.txt

- **IMPLEMENT**: Python dependencies for Phase 1
- **CONTENT**:
```
# Siphio AI Agent - Phase 1 Dependencies

# Agent Framework
pydantic-ai-slim[openrouter]>=0.0.1

# API Server
fastapi>=0.100.0
uvicorn>=0.23.0

# Configuration
pydantic-settings>=2.0.0
python-dotenv>=1.0.0

# HTTP Client (for future health checks)
httpx>=0.25.0
```
- **VALIDATE**: File exists at `agent/requirements.txt`

---

### 2. CREATE agent/.env

- **IMPLEMENT**: Environment variables with correct naming
- **SOURCE**: Copy values from `.env.local`, translate to UPPER_SNAKE_CASE
- **CONTENT**:
```
# Siphio AI Agent Configuration

# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-...  # Copy from .env.local
OPENROUTER_MODEL=x-ai/grok-4.1-fast

# Server
AGENT_PORT=8000

# Rate Limiting
MAX_TOKENS_PER_SESSION=8000
```
- **GOTCHA**: Never commit this file (already in .gitignore via `.env*` pattern)
- **VALIDATE**: File exists at `agent/.env`

---

### 3. CREATE agent/core/__init__.py

- **IMPLEMENT**: Core module initialization with exports
- **CONTENT**:
```python
"""Core infrastructure for Siphio AI Agent."""

from .config import settings
from .agent import agent
from .prompts import SYSTEM_PROMPT

__all__ = ["settings", "agent", "SYSTEM_PROMPT"]
```
- **VALIDATE**: `python -c "from core import settings"` runs without error (from agent/ dir)

---

### 4. CREATE agent/core/config.py

- **IMPLEMENT**: Pydantic Settings class for environment configuration
- **PATTERN**: Use `pydantic_settings.BaseSettings` with `env_file`
- **CONTENT**:
```python
"""Configuration management using Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenRouter Configuration
    OPENROUTER_API_KEY: str
    OPENROUTER_MODEL: str = "x-ai/grok-4.1-fast"

    # Server Configuration
    AGENT_PORT: int = 8000

    # Rate Limiting
    MAX_TOKENS_PER_SESSION: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
```
- **GOTCHA**: `SettingsConfigDict` is the Pydantic v2 pattern (not `class Config`)
- **VALIDATE**: `python -c "from core.config import settings; print(settings.OPENROUTER_MODEL)"` prints model name

---

### 5. CREATE agent/core/prompts.py

- **IMPLEMENT**: System prompt defining assistant identity and behavior
- **PATTERN**: Professional, friendly, helpful tone (per user input)
- **CONTENT**:
```python
"""System prompts for Siphio AI Agent."""

SYSTEM_PROMPT = """You are Siphio's AI Assistant, an intelligent helper on the Siphio AI website.

## Your Identity
- You represent Siphio AI, a company that builds AI-native software
- You are professional, friendly, and helpful
- You provide accurate information about Siphio's products and services

## Your Capabilities (Phase 1 - Limited)
- Engage in natural conversation
- Answer general questions professionally
- Acknowledge when you don't have specific information

## Your Boundaries
- Only discuss topics related to Siphio and its offerings
- Never make up information about Siphio's products, pricing, or services
- If asked about specific Siphio details you don't know, say so honestly
- Politely redirect off-topic conversations back to how you can help with Siphio

## Your Products (High-Level Only)
Siphio offers AI-native applications:
- Spending Insights: AI-powered financial analytics
- Checklist Manager: Intelligent task management
- AI Agents: Custom reasoning agents for businesses

For detailed product information, you'll soon have access to a knowledge base tool.

## Communication Style
- Be concise and clear
- Use a warm but professional tone
- Ask clarifying questions when needed
- Admit limitations honestly
"""
```
- **VALIDATE**: `python -c "from core.prompts import SYSTEM_PROMPT; print(len(SYSTEM_PROMPT))"` prints length

---

### 6. CREATE agent/core/agent.py

- **IMPLEMENT**: Pydantic AI agent with OpenRouter configuration
- **PATTERN**: From Pydantic AI docs - OpenRouterModel with provider
- **IMPORTS**:
  - `from pydantic_ai import Agent`
  - `from pydantic_ai.models.openrouter import OpenRouterModel`
  - `from pydantic_ai.providers.openrouter import OpenRouterProvider`
- **CONTENT**:
```python
"""Pydantic AI agent configuration."""

from pydantic_ai import Agent
from pydantic_ai.models.openrouter import OpenRouterModel
from pydantic_ai.providers.openrouter import OpenRouterProvider

from .config import settings
from .prompts import SYSTEM_PROMPT


# Initialize OpenRouter provider
provider = OpenRouterProvider(
    api_key=settings.OPENROUTER_API_KEY,
    app_title="Siphio Assistant",
)

# Initialize model
model = OpenRouterModel(
    settings.OPENROUTER_MODEL,
    provider=provider,
)

# Create agent
agent = Agent(
    model,
    system_prompt=SYSTEM_PROMPT,
    retries=2,
)
```
- **GOTCHA**: Use `result.output` not `result.data` (renamed in recent versions)
- **VALIDATE**: `python -c "from core.agent import agent; print(type(agent))"` prints Agent class

---

### 7. CREATE agent/main.py

- **IMPLEMENT**: FastAPI application with CORS and /chat endpoint
- **PATTERN**: Thin entry point - minimal logic
- **IMPORTS**:
  - `from fastapi import FastAPI, HTTPException`
  - `from fastapi.middleware.cors import CORSMiddleware`
  - `from pydantic import BaseModel, Field`
- **CONTENT**:
```python
"""FastAPI entry point for Siphio AI Agent."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from core import agent, settings


# ============ Models ============

class MessageHistoryItem(BaseModel):
    """Single message in conversation history."""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_history: list[MessageHistoryItem] = Field(default_factory=list)


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    tokens_used: int = Field(ge=0)
    tools_called: list[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ============ Application ============

app = FastAPI(
    title="Siphio AI Agent",
    description="AI-powered assistant API for Siphio",
    version="1.0.0",
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ============ Endpoints ============

@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "healthy", "service": "siphio-agent"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a user message and return AI agent response.

    Accepts optional conversation history for multi-turn context.
    """
    try:
        # Run agent with message
        # Note: message_history integration will be enhanced in later phases
        result = await agent.run(request.message)

        # Build response
        usage = result.usage()

        return ChatResponse(
            response=result.output,
            tokens_used=usage.total_tokens if usage else 0,
            tools_called=[],  # No tools in Phase 1
        )
    except Exception as e:
        # Log error in production
        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {str(e)}"
        )


# ============ Entry Point ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.AGENT_PORT,
        reload=True,
    )
```
- **GOTCHA**: CORS middleware must be added before routes
- **VALIDATE**: Server starts with `cd agent && uvicorn main:app --reload`

---

### 8. CREATE agent/features/__init__.py

- **IMPLEMENT**: Empty init for features module (placeholder for Phase 2-3)
- **CONTENT**:
```python
"""Feature slices for Siphio AI Agent.

Features are organized as vertical slices:
- knowledge/  - Knowledge base search (Phase 2)
- status/     - Service status checks (Phase 3)
- leads/      - Lead capture (Phase 3)
"""
```
- **VALIDATE**: File exists

---

### 9. CREATE agent/database/__init__.py

- **IMPLEMENT**: Empty init for database module (placeholder for Phase 3)
- **CONTENT**:
```python
"""Database configuration for Siphio AI Agent.

Uses Supabase for:
- Lead storage
- Conversation logging (future)
"""
```
- **VALIDATE**: File exists

---

### 10. UPDATE .gitignore

- **IMPLEMENT**: Add Python-specific ignore patterns
- **PATTERN**: Append to existing .gitignore
- **ADD** (at end of file):
```

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/
.venv/
*.egg-info/
dist/
build/
.eggs/
*.egg
.mypy_cache/
.ruff_cache/
```
- **VALIDATE**: `git status` shows .gitignore modified

---

## TESTING STRATEGY

### Manual Testing (Phase 1)

Since this is foundation setup, validation is primarily manual:

1. **Dependency Installation**
```bash
cd agent
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. **Configuration Test**
```bash
python -c "from core.config import settings; print(f'Model: {settings.OPENROUTER_MODEL}')"
```

3. **Server Start Test**
```bash
uvicorn main:app --reload --port 8000
```

4. **Health Check Test**
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"siphio-agent"}
```

5. **Chat Endpoint Test**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what is Siphio?"}'
```

---

## VALIDATION COMMANDS

Execute every command to ensure zero errors.

### Level 1: Environment Setup

```bash
# Create virtual environment
cd agent
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Unix)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```
**Expected**: All packages install successfully

### Level 2: Import Validation

```bash
cd agent
python -c "from core.config import settings; print('Config OK')"
python -c "from core.prompts import SYSTEM_PROMPT; print('Prompts OK')"
python -c "from core.agent import agent; print('Agent OK')"
python -c "from main import app; print('Main OK')"
```
**Expected**: All print "OK" with no import errors

### Level 3: Server Start

```bash
cd agent
uvicorn main:app --host 0.0.0.0 --port 8000
```
**Expected**: Server starts, shows "Uvicorn running on http://0.0.0.0:8000"

### Level 4: API Testing

```bash
# Health check
curl http://localhost:8000/health

# Chat endpoint (requires server running)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```
**Expected**:
- Health returns `{"status":"healthy","service":"siphio-agent"}`
- Chat returns JSON with `response`, `tokens_used`, `tools_called`

### Level 5: OpenAPI Docs

Navigate to: `http://localhost:8000/docs`

**Expected**: Swagger UI loads with `/health` and `/chat` endpoints documented

---

## ACCEPTANCE CRITERIA

- [x] Directory structure matches VSA pattern from PRD
- [ ] `requirements.txt` contains all Phase 1 dependencies
- [ ] `.env` file created with proper variable names
- [ ] `core/config.py` loads settings from `.env`
- [ ] `core/prompts.py` defines SYSTEM_PROMPT
- [ ] `core/agent.py` initializes Pydantic AI with OpenRouter
- [ ] `main.py` exposes `/health` and `/chat` endpoints
- [ ] CORS allows requests from localhost:3000
- [ ] Server starts without errors
- [ ] `/chat` endpoint returns AI response
- [ ] No hardcoded API keys in source code
- [ ] `.gitignore` updated for Python artifacts

---

## COMPLETION CHECKLIST

- [ ] All 10 tasks completed in order
- [ ] Virtual environment created and dependencies installed
- [ ] All import validations pass
- [ ] Server starts successfully
- [ ] Health endpoint returns healthy status
- [ ] Chat endpoint returns AI response
- [ ] OpenAPI docs accessible at /docs
- [ ] No errors in console
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **Conversation History**: The request model accepts `conversation_history` but Phase 1 doesn't fully utilize it. The agent.run() call currently only passes the message. Full history integration comes in later phases when we add the proper message format conversion.

2. **Error Handling**: Basic HTTPException for now. Phase 3 will add custom exception handlers per the PRD.

3. **CORS Origins**: Hardcoded localhost origins. Production origins should be added via environment variable in deployment phase.

4. **Model Settings**: Using defaults for OpenRouter. Advanced settings (reasoning tokens, fallbacks) can be added later if needed.

### Risks

1. **API Key Exposure**: The .env.local key was visible in conversation. User should rotate the key at OpenRouter.

2. **Import Path**: When running from `agent/` directory, imports use `from core...`. If running from project root, path adjustments may be needed.

### Future Enhancements (Not Phase 1)

- Message history serialization/deserialization
- Rate limiting middleware
- Custom exception handlers
- Structured logging
- Tool registrations (Phase 2-3)
