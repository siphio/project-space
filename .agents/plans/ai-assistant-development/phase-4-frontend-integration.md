# Feature: Phase 4 - Frontend Integration

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Integrate the Python AI agent backend with the existing chat UI in `waitlist1.tsx`. This phase connects the mock chat interface to the real Siphio AI Assistant, enabling visitors to have actual AI-powered conversations. The integration includes session persistence via localStorage, token usage tracking with warnings at 80% usage, and proper error handling.

## User Story

As a **website visitor**
I want to **chat with a real AI assistant about Siphio's products and services**
So that **I can get accurate information and connect with the team if interested**

## Problem Statement

The current `waitlist1.tsx` component has a polished chat UI but uses hardcoded mock responses. Users cannot actually interact with the AI agent that was built in Phases 1-3. The frontend and backend are disconnected.

## Solution Statement

1. Create a Next.js API route (`/api/chat`) that proxies requests to the Python backend
2. Replace the mock `setTimeout` logic in `waitlist1.tsx` with real API calls
3. Add localStorage persistence for session continuity across page refreshes
4. Implement token tracking with warning at 80% of 15,000 token limit
5. Handle error states gracefully (backend unavailable, rate limit exceeded)

## Feature Metadata

**Feature Type**: Enhancement (connecting existing systems)
**Estimated Complexity**: Low-Medium
**Primary Systems Affected**: `src/components/blocks/waitlist1.tsx`, `src/app/api/chat/`
**Dependencies**: Python agent running on localhost:8000

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

| File | Lines | Why |
|------|-------|-----|
| `src/components/blocks/waitlist1.tsx` | 1-168 | **PRIMARY** - Chat UI to modify; has Message interface, state, mock responses |
| `src/app/api/blog/route.ts` | 1-104 | Pattern for Next.js API routes with NextRequest/NextResponse |
| `agent/main.py` | 16-36 | Backend request/response models to mirror in TypeScript |
| `agent/main.py` | 69-99 | Backend `/chat` endpoint - understand what it accepts/returns |
| `agent/core/config.py` | 17 | Token limit setting to update (8000 → 15000) |
| `src/lib/utils.ts` | 1-6 | `cn()` utility already imported in waitlist1.tsx |
| `src/components/ui/button.tsx` | 1-62 | Button component with variants (for potential error/warning states) |
| `src/components/ui/input.tsx` | 1-21 | Input component already used |
| `tsconfig.json` | 21-23 | Path alias `@/*` maps to `./src/*` |

### New Files to Create

```
src/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts      # API route proxying to Python backend
└── types/
    └── chat.ts               # TypeScript interfaces for chat API
```

### Files to Modify

```
src/components/blocks/waitlist1.tsx  # Replace mock with real API calls
agent/core/config.py                  # Update MAX_TOKENS_PER_SESSION to 15000
```

### Relevant Documentation

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
  - Section: POST requests and JSON handling
  - Why: Pattern for creating `/api/chat` endpoint

- [React useEffect for localStorage](https://react.dev/reference/react/useEffect)
  - Section: Connecting to external systems
  - Why: Load/save session state on mount

- [Window localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
  - Section: Basic usage
  - Why: Persist session across page refreshes

### Patterns to Follow

**Next.js API Route Pattern (from blog/route.ts):**
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... process
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error message" },
      { status: 500 }
    );
  }
}
```

**Component State Pattern (from waitlist1.tsx):**
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [inputValue, setInputValue] = useState("");
const [isTyping, setIsTyping] = useState(false);
```

**Import Order (project convention):**
```typescript
// 1. React/Next
import React, { useState, useEffect } from "react";

// 2. External libraries (none needed)

// 3. Internal utilities
import { cn } from "@/lib/utils";

// 4. Internal components
import { Button } from "@/components/ui/button";
```

**Backend Request Model (from agent/main.py:23-27):**
```python
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_history: list[MessageHistoryItem] = Field(default_factory=list)
```

**Backend Response Model (from agent/main.py:30-36):**
```python
class ChatResponse(BaseModel):
    response: str
    tokens_used: int = Field(ge=0)
    tools_called: list[str] = Field(default_factory=list)
    timestamp: datetime
```

---

## IMPLEMENTATION PLAN

### Phase 1: Backend Configuration

Update token limit in Python backend.

**Tasks:**
- Update `MAX_TOKENS_PER_SESSION` from 8000 to 15000

### Phase 2: TypeScript Types

Create shared type definitions for the chat API.

**Tasks:**
- Create `src/types/chat.ts` with interfaces matching backend models

### Phase 3: API Route

Create Next.js API route to proxy to Python backend.

**Tasks:**
- Create `src/app/api/chat/route.ts`
- Implement POST handler that forwards to `http://localhost:8000/chat`
- Return backend response with error handling

### Phase 4: Frontend Integration

Update `waitlist1.tsx` to use real API and add session persistence.

**Tasks:**
- Remove hardcoded `aiResponses` array
- Add session state (session_id, tokens_used)
- Add localStorage persistence hooks
- Replace `setTimeout` mock with `fetch` to `/api/chat`
- Add token warning UI at 80% (12,000 tokens)
- Add error handling UI

---

## STEP-BY-STEP TASKS

### 1. UPDATE `agent/core/config.py`

- **IMPLEMENT**: Change token limit from 8000 to 15000
- **PATTERN**: Same structure, just update value
- **LINE**: 17
- **CHANGE**: `MAX_TOKENS_PER_SESSION: int = 8000` → `MAX_TOKENS_PER_SESSION: int = 15000`
- **VALIDATE**: `cd agent && python -c "from core.config import settings; print(settings.MAX_TOKENS_PER_SESSION)"` should print `15000`

---

### 2. CREATE `src/types/chat.ts`

- **IMPLEMENT**: TypeScript interfaces matching backend models
- **CONTENT**:
```typescript
/**
 * Chat API type definitions
 * Mirrors backend models from agent/main.py
 */

export interface MessageHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: MessageHistoryItem[];
}

export interface ChatResponse {
  response: string;
  tokens_used: number;
  tools_called: string[];
  timestamp: string;
}

export interface ChatAPIResponse {
  success: boolean;
  data?: ChatResponse;
  error?: string;
}

export interface ChatSession {
  session_id: string;
  messages: MessageHistoryItem[];
  tokens_used: number;
  created_at: string;
}

// Constants
export const MAX_TOKENS_PER_SESSION = 15000;
export const TOKEN_WARNING_THRESHOLD = 0.8; // 80%
export const TOKEN_WARNING_AMOUNT = MAX_TOKENS_PER_SESSION * TOKEN_WARNING_THRESHOLD; // 12,000
```
- **VALIDATE**: `npx tsc --noEmit src/types/chat.ts`

---

### 3. CREATE `src/app/api/chat/route.ts`

- **IMPLEMENT**: Next.js API route that proxies to Python backend
- **PATTERN**: Mirror `src/app/api/blog/route.ts` structure
- **CONTENT**:
```typescript
import { NextRequest, NextResponse } from "next/server";
import type { ChatRequest, ChatResponse, ChatAPIResponse } from "@/types/chat";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest): Promise<NextResponse<ChatAPIResponse>> {
  try {
    const body: ChatRequest = await request.json();

    // Validate required fields
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (body.message.length > 4000) {
      return NextResponse.json(
        { success: false, error: "Message exceeds maximum length of 4000 characters" },
        { status: 400 }
      );
    }

    // Forward request to Python agent
    const agentResponse = await fetch(`${AGENT_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: body.message,
        conversation_history: body.conversation_history || [],
      }),
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error("Agent API error:", errorText);

      // Handle specific error codes
      if (agentResponse.status === 429) {
        return NextResponse.json(
          { success: false, error: "Rate limit exceeded. Please wait a moment before sending another message." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to get response from AI assistant" },
        { status: agentResponse.status }
      );
    }

    const data: ChatResponse = await agentResponse.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Check if it's a connection error (agent not running)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { success: false, error: "AI assistant is currently unavailable. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
```
- **GOTCHA**: Python backend must be running on localhost:8000 for this to work
- **VALIDATE**: Start both servers and run `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message": "Hello"}'`

---

### 4. UPDATE `src/components/blocks/waitlist1.tsx`

- **IMPLEMENT**: Replace mock responses with real API integration
- **PATTERN**: Keep existing UI, only change state management and message handling
- **FULL REPLACEMENT**:

```typescript
"use client";

import React, { useState, useEffect, useCallback } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  MessageHistoryItem,
  ChatSession,
  ChatAPIResponse,
} from "@/types/chat";

interface Waitlist1Props {
  className?: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

// Constants
const MAX_TOKENS = 15000;
const WARNING_THRESHOLD = 12000; // 80% of 15000
const STORAGE_KEY = "siphio_chat_session";

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Convert internal Message format to API format
const toApiFormat = (messages: Message[]): MessageHistoryItem[] => {
  return messages.map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.content,
  }));
};

const Waitlist1 = ({ className }: Waitlist1Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session: ChatSession = JSON.parse(stored);
        // Check if session is less than 24 hours old
        const sessionAge = Date.now() - new Date(session.created_at).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxAge) {
          setSessionId(session.session_id);
          setTokensUsed(session.tokens_used);
          // Convert API format back to internal format
          setMessages(
            session.messages.map((msg) => ({
              role: msg.role === "assistant" ? "ai" : "user",
              content: msg.content,
            }))
          );
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load chat session:", e);
    }

    // Create new session if none exists or expired
    setSessionId(generateSessionId());
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (!sessionId) return;

    const session: ChatSession = {
      session_id: sessionId,
      messages: toApiFormat(messages),
      tokens_used: tokensUsed,
      created_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Failed to save chat session:", e);
    }
  }, [sessionId, messages, tokensUsed]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isTyping) return;

    // Clear any previous error
    setError(null);

    // Check if token limit reached
    if (tokensUsed >= MAX_TOKENS) {
      setError("You've reached the conversation limit. Please start a new session.");
      return;
    }

    const userMessage = inputValue.trim();

    // Add user message immediately
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: toApiFormat(newMessages.slice(0, -1)), // Exclude the message we just added
        }),
      });

      const result: ChatAPIResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to get response");
      }

      // Add AI response
      setMessages([...newMessages, { role: "ai", content: result.data.response }]);

      // Update token count
      setTokensUsed((prev) => prev + result.data!.tokens_used);
    } catch (e) {
      console.error("Chat error:", e);
      setError(e instanceof Error ? e.message : "Failed to send message. Please try again.");
      // Remove the user message if we failed
      setMessages(messages);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, messages, tokensUsed]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    setTokensUsed(0);
    setSessionId(generateSessionId());
    setError(null);
  };

  // Calculate if we should show token warning
  const showTokenWarning = tokensUsed >= WARNING_THRESHOLD && tokensUsed < MAX_TOKENS;
  const tokensRemaining = MAX_TOKENS - tokensUsed;

  return (
    <section
      id="ai-assistant"
      className={cn(
        "relative w-full -mt-32",
        className,
      )}
    >
      {/* Background image - dictates section height */}
      <div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
        <img
          src="/BQiYmiVXsJHqfjf3bLqlc.png"
          alt=""
          className="w-full h-full object-cover absolute inset-0"
          aria-hidden="true"
        />
        {/* Top gradient - natural rounded fade from white into image */}
        <div
          className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 150% 70% at 50% 0%, white 0%, white 40%, rgba(255,255,255,0.8) 55%, rgba(255,255,255,0.4) 70%, transparent 100%)'
          }}
          aria-hidden="true"
        />

        {/* Content - positioned over the image */}
        <div className="relative z-10 container mx-auto px-4 min-h-[100vh] flex flex-col items-center justify-center pt-32">
          <h2 className="relative z-20 py-2 text-center font-sans text-4xl font-semibold tracking-tighter md:py-10 lg:text-6xl">
            Got Questions? Ask SIPHIO
          </h2>
          <p className="text-md mx-auto max-w-xl text-center text-black font-medium lg:text-lg">
            Describe your idea or problem - our AI will ask the right questions and send your details to the team.
          </p>

          {/* Chat container */}
          <div className="relative z-20 mt-10 w-full max-w-lg">
            {/* Token warning banner */}
            {showTokenWarning && (
              <div className="mb-4 rounded-xl bg-amber-100 border border-amber-300 p-3 text-sm text-amber-800">
                <span className="font-medium">Approaching limit:</span> {tokensRemaining.toLocaleString()} tokens remaining in this session.
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-100 border border-red-300 p-3 text-sm text-red-800 flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Messages area - grows as conversation continues */}
            {messages.length > 0 && (
              <div className="mb-4 rounded-2xl bg-white/90 backdrop-blur-sm p-4 shadow-lg max-h-80 overflow-y-auto transition-all duration-300">
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          message.role === "user"
                            ? "bg-black text-white"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground rounded-2xl px-4 py-2 text-sm">
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="flex w-full items-center gap-3 rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-lg">
              <Input
                className="h-10 w-full rounded-xl border-none bg-muted shadow-none ring-0 focus-visible:ring-0 focus-visible:outline-none active:ring-0 active:outline-0"
                placeholder="Tell us what you need..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping || tokensUsed >= MAX_TOKENS}
              />
              <Button
                className="h-10 rounded-xl"
                onClick={handleSendMessage}
                disabled={isTyping || !inputValue.trim() || tokensUsed >= MAX_TOKENS}
              >
                Send Message
              </Button>
            </div>

            {/* Session controls */}
            {messages.length > 0 && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={handleClearSession}
                  className="text-xs text-black/50 hover:text-black/70 underline"
                >
                  Clear conversation
                </button>
              </div>
            )}
          </div>

          {/* Logo stamp */}
          <div className="mt-16 flex justify-center">
            <img
              src="/siphio-logo-black.png"
              alt="Siphio AI"
              className="h-14 w-auto opacity-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Waitlist1 };
```

- **GOTCHA**: The `onKeyPress` is deprecated but kept for consistency with original code; could use `onKeyDown` instead
- **GOTCHA**: Session expires after 24 hours to prevent stale conversations
- **VALIDATE**: Visual inspection - chat should show typing indicator, then real AI response

---

## TESTING STRATEGY

### Manual Testing (No test framework configured for frontend)

Since this is a frontend integration, testing is primarily manual:

**1. Prerequisites**
```bash
# Terminal 1: Start Supabase (for leads)
cd C:\Users\marley\webapp-test
supabase start

# Terminal 2: Start Python agent
cd C:\Users\marley\webapp-test\agent
.\venv\Scripts\activate
python main.py

# Terminal 3: Start Next.js
cd C:\Users\marley\webapp-test
npm run dev
```

**2. API Route Test**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Spending Insights?"}'
```
Expected: JSON with `success: true` and `data.response` containing information about Spending Insights

**3. UI Interaction Tests**

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Basic message | Type "Hello" and click Send | AI responds with greeting |
| Knowledge query | Ask "What apps does Siphio offer?" | Agent uses search_knowledge_base tool, returns accurate info |
| Session persistence | Send message, refresh page | Previous messages still visible |
| Token warning | Send many messages until 12,000+ tokens | Yellow warning banner appears |
| Error handling | Stop Python agent, send message | Red error banner with retry option |
| Clear session | Click "Clear conversation" | Messages cleared, localStorage cleared |

**4. localStorage Verification**
```javascript
// In browser console
JSON.parse(localStorage.getItem('siphio_chat_session'))
```
Expected: Object with session_id, messages array, tokens_used, created_at

### Edge Cases

- [ ] Empty message submission (should be prevented by UI)
- [ ] Very long message (>4000 chars) - API should return 400 error
- [ ] Rapid message sending - typing state prevents double submission
- [ ] Network disconnect mid-request - error banner should appear
- [ ] Corrupted localStorage - should create new session

---

## VALIDATION COMMANDS

### Level 1: Syntax & Types

```bash
# TypeScript type checking
cd C:\Users\marley\webapp-test
npx tsc --noEmit

# ESLint
npm run lint
```
**Expected**: No errors

### Level 2: Build Verification

```bash
npm run build
```
**Expected**: Build succeeds with no errors

### Level 3: Backend Validation

```bash
# Check token limit updated
cd agent
python -c "from core.config import settings; assert settings.MAX_TOKENS_PER_SESSION == 15000, 'Token limit not updated'"
echo "Token limit OK"
```

### Level 4: API Endpoint Test

```bash
# With both servers running
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' | jq .
```
**Expected**: `{"success": true, "data": {"response": "...", "tokens_used": X, ...}}`

### Level 5: Integration Test

```bash
# Test full flow with knowledge query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about Spending Insights"}' | jq .
```
**Expected**: Response mentions Spending Insights with accurate information from knowledge base

---

## ACCEPTANCE CRITERIA

- [ ] Python backend token limit updated to 15,000
- [ ] TypeScript types created matching backend models
- [ ] API route successfully proxies to Python backend
- [ ] Chat UI sends real messages to backend (no more mock responses)
- [ ] AI responses display in chat bubbles
- [ ] Typing indicator shows while waiting for response
- [ ] Session persists in localStorage across page refreshes
- [ ] Token warning appears at 80% usage (12,000 tokens)
- [ ] Error messages display when backend unavailable
- [ ] "Clear conversation" button resets session
- [ ] All validation commands pass
- [ ] `npm run build` succeeds

---

## COMPLETION CHECKLIST

- [ ] Task 1: `agent/core/config.py` - Token limit updated to 15000
- [ ] Task 2: `src/types/chat.ts` - TypeScript interfaces created
- [ ] Task 3: `src/app/api/chat/route.ts` - API route created
- [ ] Task 4: `src/components/blocks/waitlist1.tsx` - Integration complete
- [ ] Validation Level 1: TypeScript compiles without errors
- [ ] Validation Level 2: Next.js builds successfully
- [ ] Validation Level 3: Backend token limit verified
- [ ] Validation Level 4: API endpoint returns expected response
- [ ] Validation Level 5: Full integration test passes
- [ ] Manual testing: All UI test cases pass
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **Session Storage**: Using localStorage (not sessionStorage) so conversations persist across browser tabs and restarts. Sessions expire after 24 hours to prevent stale context.

2. **Token Tracking**: Tokens are tracked cumulatively in the frontend. The backend returns `tokens_used` per request, which we accumulate. Warning at 80% gives users time to wrap up.

3. **Error Handling**: Errors are shown in a dismissible banner rather than replacing the chat UI. This allows users to retry without losing context.

4. **Message Format Conversion**: Internal `Message` uses `role: "ai"` for display, but API expects `role: "assistant"`. Conversion happens at API boundaries.

5. **No Streaming**: This implementation waits for full response before displaying. Streaming could be added later with Server-Sent Events.

### Environment Variable

The API route uses `AGENT_API_URL` environment variable with fallback to `http://localhost:8000`. For production, add to `.env.local`:

```
AGENT_API_URL=https://agent.siphio.ai  # or wherever the agent is deployed
```

### Dependencies

No new npm packages required - using only built-in Next.js features and existing project dependencies.

### Risks

1. **CORS**: If deploying to different domains, ensure Python backend CORS allows the production origin
2. **Rate Limiting**: Currently no server-side rate limiting on the Next.js route - relies on backend limits
3. **Token Count Accuracy**: Token count is from backend response; if backend fails to report, tracking may drift
