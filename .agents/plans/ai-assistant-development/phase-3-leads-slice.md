# Feature: Phase 3 - Leads Slice with Supabase Integration

## Feature Description

Implement the Leads vertical slice for the Siphio AI Agent, enabling lead capture functionality. This includes:
- Supabase local database setup with leads table
- Lead capture tool for the AI agent (`capture_lead`)
- Email validation and duplicate detection (flag duplicates, don't block)
- In-memory rate limiting for session token tracking

## User Story

As a potential client interested in Siphio's services,
I want to provide my contact information through the chat assistant,
So that the Siphio team can follow up with me about my project needs.

## Problem Statement

The AI agent can answer questions about Siphio but cannot capture leads when users express genuine business interest. Without lead capture, potential clients have no way to connect with the team through the chat interface.

## Solution Statement

Implement a complete vertical slice for lead capture that:
1. Provides a `capture_lead` tool for the AI agent
2. Validates email format and detects duplicates (24hr window)
3. Stores leads in Supabase with conversation context
4. Returns confirmation with reference ID to users

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: `agent/features/leads/`, `agent/database/`, `agent/core/`
**Dependencies**: supabase>=2.0.0, Supabase CLI (local)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

| File | Lines | Why |
|------|-------|-----|
| `agent/features/knowledge/models.py` | 1-36 | Pattern for Pydantic models with `Field()`, `Literal[]` types |
| `agent/features/knowledge/search.py` | 1-305 | Pattern for business logic with private helpers and async public API |
| `agent/features/knowledge/tool.py` | 1-37 | Pattern for `@agent.tool` decorator with `RunContext[None]` |
| `agent/features/knowledge/__init__.py` | 1-24 | Pattern for exports and lazy loading to avoid circular imports |
| `agent/core/config.py` | 1-27 | Pattern for adding new environment variables |
| `agent/core/agent.py` | 30-32 | Where to import tool for registration |
| `agent/tests/features/knowledge/test_search.py` | 1-187 | Pattern for async pytest tests |
| `.agents/PRD.md` | 450-486 | Tool specification for `capture_lead` |

### New Files to Create

```
agent/
├── database/
│   ├── client.py              # Supabase client initialization
│   └── migrations/
│       └── 001_create_leads.sql
├── features/
│   └── leads/
│       ├── __init__.py        # Exports
│       ├── models.py          # LeadResult, InquiryType types
│       ├── validation.py      # Email validation logic
│       ├── capture.py         # Business logic (duplicate check, insert)
│       └── tool.py            # @agent.tool capture_lead
└── tests/
    └── features/
        └── leads/
            ├── __init__.py
            ├── test_validation.py
            └── test_capture.py
```

### Relevant Documentation

- [Supabase Python Insert](https://supabase.com/docs/reference/python/insert) - Insert pattern
- [Supabase Python Select](https://supabase.com/docs/reference/python/select) - Query with filters
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli) - Local setup

### Patterns to Follow

**Pydantic Models (from knowledge/models.py):**
```python
from typing import Optional, Literal
from pydantic import BaseModel, Field

InquiryType = Literal["freelance_project", "app_question", "partnership", "other"]

class LeadResult(BaseModel):
    success: bool = Field(..., description="Whether lead was captured")
    reference_id: Optional[str] = Field(None, description="Reference for user")
    message: str = Field(..., description="Confirmation message")
    error: Optional[str] = Field(None, description="Error if validation failed")
    is_duplicate: bool = Field(False, description="Whether flagged as duplicate")
```

**Tool Registration (from knowledge/tool.py):**
```python
@agent.tool
async def capture_lead(
    ctx: RunContext[None],
    name: str,
    email: str,
    conversation_summary: str,
    inquiry_type: InquiryType = "other",
) -> LeadResult:
    """Capture lead information..."""
    return await execute_capture(name, email, conversation_summary, inquiry_type)
```

**Config Pattern (from core/config.py):**
```python
SUPABASE_URL: str = "http://localhost:54321"
SUPABASE_ANON_KEY: str = ""  # Will be set from supabase start output
```

---

## IMPLEMENTATION PLAN

### Phase 1: Supabase Setup

1. Initialize Supabase in project root (if not done)
2. Create leads table migration with `is_duplicate` flag
3. Start Supabase local and capture connection details
4. Create database client module

### Phase 2: Leads Slice - Models & Validation

1. Create `features/leads/models.py` with Pydantic types
2. Create `features/leads/validation.py` with email validation
3. Create `features/leads/__init__.py` with exports

### Phase 3: Leads Slice - Business Logic

1. Create `features/leads/capture.py` with:
   - Duplicate detection (check last 24 hours)
   - Lead insertion with `is_duplicate` flag
   - Reference ID generation
2. Create `features/leads/tool.py` with `@agent.tool`

### Phase 4: Integration

1. Add Supabase env vars to `core/config.py`
2. Update `core/agent.py` to import leads tool
3. Update `core/prompts.py` to include lead capture instructions

### Phase 5: Testing

1. Create test fixtures and validation tests
2. Create capture logic tests (mock Supabase)

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `supabase/` directory structure

Run Supabase CLI to initialize:
```bash
cd C:\Users\marley\webapp-test
supabase init
```

**VALIDATE**: `dir supabase` shows `config.toml`

---

### Task 2: CREATE `supabase/migrations/001_create_leads.sql`

```sql
-- Create leads table for storing captured leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    conversation_summary TEXT NOT NULL,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('freelance_project', 'app_question', 'partnership', 'other')),
    is_duplicate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (agent backend)
CREATE POLICY "Service role can do everything" ON leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Index for duplicate checking (email + recent created_at)
CREATE INDEX idx_leads_email_created ON leads (email, created_at DESC);
```

**VALIDATE**: `supabase db reset` runs without errors

---

### Task 3: START Supabase local

```bash
supabase start
```

Capture output values:
- `API URL`: http://localhost:54321
- `anon key`: (copy this)
- `service_role key`: (copy this)

**VALIDATE**: `supabase status` shows all services running

---

### Task 4: UPDATE `agent/requirements.txt`

**ADD** after `rapidfuzz>=3.0.0`:
```
# Database
supabase>=2.0.0
```

**VALIDATE**: `pip install -r requirements.txt` succeeds

---

### Task 5: UPDATE `agent/core/config.py`

**ADD** Supabase configuration after `MAX_TOKENS_PER_SESSION`:

```python
# Supabase Configuration
SUPABASE_URL: str = "http://localhost:54321"
SUPABASE_ANON_KEY: str = ""  # Set from supabase start output
```

**VALIDATE**: Python import succeeds: `python -c "from core.config import settings; print(settings.SUPABASE_URL)"`

---

### Task 6: CREATE `agent/database/client.py`

```python
"""Supabase client initialization."""

from supabase import create_client, Client

from core.config import settings


def get_supabase_client() -> Client:
    """Get Supabase client instance.

    Returns:
        Configured Supabase client
    """
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY,
    )


# Singleton client instance
supabase: Client = get_supabase_client()
```

**VALIDATE**: `python -c "from database.client import supabase; print(type(supabase))"`

---

### Task 7: UPDATE `agent/database/__init__.py`

```python
"""Database configuration for Siphio AI Agent.

Uses Supabase for:
- Lead storage
- Conversation logging (future)
"""

from .client import supabase, get_supabase_client

__all__ = ["supabase", "get_supabase_client"]
```

---

### Task 8: CREATE `agent/features/leads/__init__.py`

```python
"""Lead capture feature slice."""

from .models import LeadResult, InquiryType
from .capture import execute_capture

__all__ = [
    "LeadResult",
    "InquiryType",
    "execute_capture",
]


def get_tool():
    """Get the capture_lead tool (lazy import to avoid circular deps)."""
    from .tool import capture_lead
    return capture_lead
```

---

### Task 9: CREATE `agent/features/leads/models.py`

```python
"""Pydantic models for lead capture feature."""

from typing import Optional, Literal
from pydantic import BaseModel, Field


# Type aliases
InquiryType = Literal["freelance_project", "app_question", "partnership", "other"]


class LeadResult(BaseModel):
    """Result from lead capture operation."""

    success: bool = Field(..., description="Whether lead was captured successfully")
    reference_id: Optional[str] = Field(
        None, description="Reference ID for user follow-up"
    )
    message: str = Field(..., description="Confirmation or error message")
    error: Optional[str] = Field(
        None, description="Error details if validation failed"
    )
    is_duplicate: bool = Field(
        False, description="Whether this is a duplicate submission"
    )
```

**VALIDATE**: `python -c "from features.leads.models import LeadResult, InquiryType; print(LeadResult.__fields__.keys())"`

---

### Task 10: CREATE `agent/features/leads/validation.py`

```python
"""Email and input validation for lead capture."""

import re
from typing import Optional


# RFC 5322 simplified email regex
EMAIL_PATTERN = re.compile(
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)


def validate_email(email: str) -> tuple[bool, Optional[str]]:
    """Validate email format.

    Args:
        email: Email address to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not email or not email.strip():
        return False, "Email is required"

    email = email.strip().lower()

    if len(email) > 254:
        return False, "Email address too long"

    if not EMAIL_PATTERN.match(email):
        return False, "Invalid email format"

    return True, None


def validate_name(name: str) -> tuple[bool, Optional[str]]:
    """Validate name input.

    Args:
        name: Name to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not name or not name.strip():
        return False, "Name is required"

    name = name.strip()

    if len(name) < 2:
        return False, "Name must be at least 2 characters"

    if len(name) > 100:
        return False, "Name must be less than 100 characters"

    return True, None
```

**VALIDATE**: `python -c "from features.leads.validation import validate_email; print(validate_email('test@example.com'))"`

---

### Task 11: CREATE `agent/features/leads/capture.py`

```python
"""Lead capture business logic."""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from database.client import supabase
from .models import LeadResult, InquiryType
from .validation import validate_email, validate_name


def _generate_reference_id() -> str:
    """Generate a short reference ID for the user."""
    return f"SIPH-{uuid.uuid4().hex[:8].upper()}"


def _check_duplicate(email: str) -> bool:
    """Check if email submitted within last 24 hours.

    Args:
        email: Email to check

    Returns:
        True if duplicate found
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    cutoff_iso = cutoff.isoformat()

    result = (
        supabase.table("leads")
        .select("id")
        .eq("email", email.lower().strip())
        .gte("created_at", cutoff_iso)
        .limit(1)
        .execute()
    )

    return len(result.data) > 0


def _insert_lead(
    name: str,
    email: str,
    conversation_summary: str,
    inquiry_type: InquiryType,
    is_duplicate: bool,
) -> str:
    """Insert lead into database.

    Returns:
        Generated reference ID
    """
    reference_id = _generate_reference_id()

    supabase.table("leads").insert({
        "name": name.strip(),
        "email": email.lower().strip(),
        "conversation_summary": conversation_summary,
        "inquiry_type": inquiry_type,
        "is_duplicate": is_duplicate,
    }).execute()

    return reference_id


async def execute_capture(
    name: str,
    email: str,
    conversation_summary: str,
    inquiry_type: InquiryType = "other",
) -> LeadResult:
    """Execute lead capture flow.

    Args:
        name: User's name
        email: User's email
        conversation_summary: Summary of conversation
        inquiry_type: Type of inquiry

    Returns:
        LeadResult with success status and reference ID
    """
    # Validate inputs
    name_valid, name_error = validate_name(name)
    if not name_valid:
        return LeadResult(
            success=False,
            message="Could not capture your information.",
            error=name_error,
        )

    email_valid, email_error = validate_email(email)
    if not email_valid:
        return LeadResult(
            success=False,
            message="Could not capture your information.",
            error=email_error,
        )

    # Check for duplicates
    is_duplicate = _check_duplicate(email)

    # Insert lead
    try:
        reference_id = _insert_lead(
            name=name,
            email=email,
            conversation_summary=conversation_summary,
            inquiry_type=inquiry_type,
            is_duplicate=is_duplicate,
        )
    except Exception as e:
        return LeadResult(
            success=False,
            message="Could not save your information. Please try again.",
            error=str(e),
        )

    # Build response message
    if is_duplicate:
        message = (
            f"Thanks {name.strip()}! We already have a recent inquiry from you. "
            f"Your reference ID is {reference_id}. Our team will be in touch soon!"
        )
    else:
        message = (
            f"Thanks {name.strip()}! Your information has been saved. "
            f"Your reference ID is {reference_id}. Our team will reach out within 24-48 hours."
        )

    return LeadResult(
        success=True,
        reference_id=reference_id,
        message=message,
        is_duplicate=is_duplicate,
    )
```

**VALIDATE**: `python -c "from features.leads.capture import execute_capture; print('Import OK')"`

---

### Task 12: CREATE `agent/features/leads/tool.py`

```python
"""Pydantic AI tool for lead capture."""

from typing import Optional

from pydantic_ai import RunContext

from core.agent import agent
from .models import LeadResult, InquiryType
from .capture import execute_capture


@agent.tool
async def capture_lead(
    ctx: RunContext[None],
    name: str,
    email: str,
    conversation_summary: str,
    inquiry_type: InquiryType = "other",
) -> LeadResult:
    """Capture lead information when a user wants to connect with the Siphio team.

    Use this tool when:
    - A user expresses interest in Siphio's services
    - A user wants to discuss a project or partnership
    - A user asks to be contacted or followed up with
    - A user provides their contact information

    Do NOT use this tool for:
    - Simple informational questions
    - Users who haven't expressed interest in connecting

    Args:
        name: The user's full name
        email: The user's email address (will be validated)
        conversation_summary: A brief summary of what the user is interested in
            and any requirements they mentioned
        inquiry_type: Classification of the inquiry:
            - "freelance_project": User wants to hire for a project
            - "app_question": User has questions about Siphio apps
            - "partnership": User wants to explore partnership
            - "other": General inquiry

    Returns:
        LeadResult with success status, reference ID, and confirmation message
    """
    return await execute_capture(name, email, conversation_summary, inquiry_type)
```

---

### Task 13: UPDATE `agent/core/agent.py`

**ADD** import after `search_knowledge_base` import (line 32):

```python
from features.leads.tool import capture_lead  # noqa: F401, E402
```

---

### Task 14: UPDATE `agent/core/prompts.py`

**ADD** to SYSTEM_PROMPT after knowledge base instructions:

```python
# Add to SYSTEM_PROMPT string:
"""
## Lead Capture

When a user expresses genuine interest in working with Siphio or wants to be contacted:
1. Gather their name and email through natural conversation
2. Summarize what they're looking for
3. Use the `capture_lead` tool to save their information
4. Provide them with their reference ID

Only capture leads when there's clear interest - don't ask for contact info on simple questions.
"""
```

---

### Task 15: UPDATE `agent/.env`

**ADD** Supabase credentials (get from `supabase status`):

```
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<paste anon key from supabase start>
```

---

### Task 16: CREATE `agent/tests/features/leads/__init__.py`

```python
"""Tests for leads feature slice."""
```

---

### Task 17: CREATE `agent/tests/features/leads/test_validation.py`

```python
"""Tests for lead validation."""

import pytest

from features.leads.validation import validate_email, validate_name


class TestEmailValidation:
    """Test email validation."""

    def test_valid_email(self):
        """Valid email should pass."""
        valid, error = validate_email("test@example.com")
        assert valid is True
        assert error is None

    def test_valid_email_with_dots(self):
        """Email with dots should pass."""
        valid, error = validate_email("first.last@example.co.uk")
        assert valid is True

    def test_invalid_email_no_at(self):
        """Email without @ should fail."""
        valid, error = validate_email("testexample.com")
        assert valid is False
        assert "Invalid email" in error

    def test_invalid_email_empty(self):
        """Empty email should fail."""
        valid, error = validate_email("")
        assert valid is False
        assert "required" in error.lower()

    def test_email_whitespace_stripped(self):
        """Email whitespace should be handled."""
        valid, error = validate_email("  test@example.com  ")
        assert valid is True


class TestNameValidation:
    """Test name validation."""

    def test_valid_name(self):
        """Valid name should pass."""
        valid, error = validate_name("John Doe")
        assert valid is True
        assert error is None

    def test_name_too_short(self):
        """Single character name should fail."""
        valid, error = validate_name("J")
        assert valid is False
        assert "at least 2" in error

    def test_empty_name(self):
        """Empty name should fail."""
        valid, error = validate_name("")
        assert valid is False
        assert "required" in error.lower()
```

**VALIDATE**: `cd agent && python -m pytest tests/features/leads/test_validation.py -v`

---

### Task 18: CREATE `agent/tests/features/leads/test_capture.py`

```python
"""Tests for lead capture logic."""

import pytest
from unittest.mock import patch, MagicMock

from features.leads.models import LeadResult
from features.leads.capture import execute_capture, _generate_reference_id


class TestReferenceIdGeneration:
    """Test reference ID generation."""

    def test_reference_id_format(self):
        """Reference ID should have correct format."""
        ref_id = _generate_reference_id()
        assert ref_id.startswith("SIPH-")
        assert len(ref_id) == 13  # SIPH- + 8 chars

    def test_reference_id_unique(self):
        """Reference IDs should be unique."""
        ids = [_generate_reference_id() for _ in range(100)]
        assert len(set(ids)) == 100


class TestExecuteCapture:
    """Test lead capture execution."""

    @pytest.mark.asyncio
    async def test_invalid_email_returns_error(self):
        """Invalid email should return error result."""
        result = await execute_capture(
            name="John Doe",
            email="invalid-email",
            conversation_summary="Test summary",
        )
        assert result.success is False
        assert result.error is not None
        assert "email" in result.error.lower()

    @pytest.mark.asyncio
    async def test_invalid_name_returns_error(self):
        """Invalid name should return error result."""
        result = await execute_capture(
            name="",
            email="test@example.com",
            conversation_summary="Test summary",
        )
        assert result.success is False
        assert result.error is not None

    @pytest.mark.asyncio
    @patch("features.leads.capture.supabase")
    async def test_successful_capture(self, mock_supabase):
        """Successful capture should return success result."""
        # Mock the table operations
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.gte.return_value.limit.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        result = await execute_capture(
            name="John Doe",
            email="john@example.com",
            conversation_summary="Interested in AI development",
            inquiry_type="freelance_project",
        )

        assert result.success is True
        assert result.reference_id is not None
        assert result.reference_id.startswith("SIPH-")
        assert "John" in result.message

    @pytest.mark.asyncio
    @patch("features.leads.capture.supabase")
    async def test_duplicate_detection(self, mock_supabase):
        """Duplicate email should be flagged."""
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        # Return existing lead
        mock_table.select.return_value.eq.return_value.gte.return_value.limit.return_value.execute.return_value.data = [{"id": "123"}]
        mock_table.insert.return_value.execute.return_value = MagicMock()

        result = await execute_capture(
            name="John Doe",
            email="john@example.com",
            conversation_summary="Another inquiry",
        )

        assert result.success is True
        assert result.is_duplicate is True
        assert "already have" in result.message.lower()
```

**VALIDATE**: `cd agent && python -m pytest tests/features/leads/test_capture.py -v`

---

## TESTING STRATEGY

### Unit Tests

- `test_validation.py`: Email/name validation (no mocking needed)
- `test_capture.py`: Capture logic with mocked Supabase client

### Integration Tests (Manual)

1. Start Supabase: `supabase start`
2. Start agent: `cd agent && python main.py`
3. Send test request:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi, I want to discuss a project. My name is Test User and email is test@example.com"}'
```
4. Check Supabase Studio: http://localhost:54323 → leads table

---

## VALIDATION COMMANDS

### Level 1: Syntax & Dependencies

```bash
cd agent
pip install -r requirements.txt
python -c "from features.leads import LeadResult, execute_capture; print('OK')"
```

### Level 2: Unit Tests

```bash
cd agent
python -m pytest tests/features/leads/ -v
```

### Level 3: Integration Test

```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Start agent
cd agent && python main.py

# Terminal 3: Test request
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### Level 4: Database Verification

```bash
# Check leads table in Supabase Studio
# Navigate to http://localhost:54323
# Go to Table Editor → leads
```

---

## ACCEPTANCE CRITERIA

- [ ] Supabase local running with leads table
- [ ] `capture_lead` tool registered with agent
- [ ] Email validation rejects invalid formats
- [ ] Duplicate emails within 24hr are flagged but stored
- [ ] Reference ID returned to user on success
- [ ] All unit tests pass
- [ ] Integration test captures lead in database

---

## COMPLETION CHECKLIST

- [ ] `supabase init` completed
- [ ] Migration created and applied
- [ ] Supabase credentials in `.env`
- [ ] `database/client.py` created
- [ ] `features/leads/` slice created (5 files)
- [ ] Tool registered in `core/agent.py`
- [ ] Prompts updated for lead capture
- [ ] Unit tests passing
- [ ] Manual integration test successful

---

## NOTES

**Design Decisions:**
1. **Sync Supabase client**: Using sync `create_client` (not async) because Pydantic AI tools are async but Supabase operations are fast enough
2. **Flag duplicates, don't block**: User requested this - duplicates are stored with `is_duplicate=True`
3. **Reference ID format**: `SIPH-XXXXXXXX` for brand recognition and easy reference
4. **No rate limiting in this slice**: Rate limiting is in-memory in `core/` - separate concern

**Skipped (per user request):**
- Status slice (apps not live yet)
- Redis/database-backed rate limiting (in-memory OK for MVP)
