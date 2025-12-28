"""FastAPI entry point for Siphio AI Agent."""

import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_ai.messages import ModelMessage, ModelRequest, ModelResponse, UserPromptPart, TextPart

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
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Handoff fields - when agent is ready to pass to team
    handoff_ready: bool = False
    handoff_summary: Optional[str] = None


class LeadRequest(BaseModel):
    """Request model for lead capture endpoint."""

    name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(..., min_length=5, max_length=320)
    conversation_summary: str = Field(default="")
    inquiry_type: str = Field(default="freelance_project")


class LeadResponse(BaseModel):
    """Response model for lead capture endpoint."""

    success: bool
    reference_id: Optional[str] = None
    message: str
    error: Optional[str] = None


# ============ Helpers ============


def build_message_history(history: list[MessageHistoryItem]) -> list[ModelMessage]:
    """
    Convert conversation history to Pydantic AI message format.

    Args:
        history: List of MessageHistoryItem from the request

    Returns:
        List of ModelMessage objects for Pydantic AI
    """
    messages: list[ModelMessage] = []

    for item in history:
        if item.role == "user":
            messages.append(
                ModelRequest(parts=[UserPromptPart(content=item.content)])
            )
        elif item.role == "assistant":
            messages.append(
                ModelResponse(parts=[TextPart(content=item.content)])
            )

    return messages


def parse_handoff_summary(response: str) -> tuple[str, Optional[str]]:
    """
    Extract handoff summary from agent response if present.

    Agent uses format: [HANDOFF_SUMMARY]...summary...[/HANDOFF_SUMMARY]

    Returns: (cleaned_response, summary_or_none)
    """
    pattern = r'\[HANDOFF_SUMMARY\](.*?)\[/HANDOFF_SUMMARY\]'
    match = re.search(pattern, response, re.DOTALL)

    if match:
        summary = match.group(1).strip()
        # Remove the markers from the response
        cleaned = re.sub(pattern, '', response, flags=re.DOTALL).strip()
        return cleaned, summary

    return response, None


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
        # Log incoming message
        print(f"\n{'='*50}")
        print(f"USER: {request.message}")
        print(f"HISTORY: {len(request.conversation_history)} messages")

        # Convert conversation history to Pydantic AI format
        message_history = build_message_history(request.conversation_history)

        # Determine conversation state based on history length
        num_messages = len(request.conversation_history)

        # Extract info from conversation
        app_features = ""
        platform = ""
        for msg in request.conversation_history:
            if msg.role == "user" and len(msg.content) > 5:
                content_lower = msg.content.lower()
                if not app_features and any(word in content_lower for word in ['track', 'manage', 'create', 'show', 'workout', 'subscription', 'member']):
                    app_features = msg.content
                if not platform and any(word in content_lower for word in ['phone', 'mobile', 'ios', 'android', 'website', 'web']):
                    platform = "phone" if any(w in content_lower for w in ['phone', 'mobile', 'ios', 'android']) else "website"

        # Check if user is confirming handoff
        user_lower = request.message.lower().strip()
        is_affirmative = user_lower in ['yes', 'yeah', 'sure', 'yep', 'ok', 'okay', 'yes please', 'yes, please', 'y', 'yea']

        # Check if last message asked about handoff
        last_asked_handoff = False
        if request.conversation_history:
            last_msg = request.conversation_history[-1]
            if last_msg.role == "assistant" and "pass" in last_msg.content.lower() and "team" in last_msg.content.lower():
                last_asked_handoff = True

        # STATE MACHINE - force correct responses
        if is_affirmative and last_asked_handoff:
            # User confirmed handoff - return summary directly (bypass LLM)
            summary = f"App for {platform or 'phone'} - {app_features or 'custom app'}"
            forced_response = f"Great, I'll let the team know!\n\n[HANDOFF_SUMMARY]{summary}[/HANDOFF_SUMMARY]"

            print(f"AGENT (FORCED): {forced_response}")
            print(f"HANDOFF_READY: True")
            print(f"{'='*50}\n")

            return ChatResponse(
                response="Great, I'll let the team know!",
                tokens_used=0,
                tools_called=[],
                handoff_ready=True,
                handoff_summary=summary,
            )

        # Check if we should ask about handoff (have features + platform)
        should_ask_handoff = False
        if platform and app_features and num_messages >= 4:
            should_ask_handoff = True
        elif platform or any(word in user_lower for word in ['phone', 'mobile', 'website', 'web', 'ios', 'android']):
            should_ask_handoff = True

        if should_ask_handoff:
            # Force the handoff question AND return handoff_ready so frontend knows to wait
            summary = f"App for {platform or 'phone'} - {app_features or 'custom app'}"

            print(f"AGENT (ASKING HANDOFF): Want me to pass this to the team?")
            print(f"HANDOFF_READY: True (waiting for confirmation)")
            print(f"SUMMARY: {summary}")
            print(f"{'='*50}\n")

            return ChatResponse(
                response="Want me to pass this to the team?",
                tokens_used=0,
                tools_called=[],
                handoff_ready=True,
                handoff_summary=summary,
            )

        elif app_features or num_messages >= 2:
            # Have features, ask about platform
            instruction = """[INSTRUCTION: Say ONLY this: "Phone app or website?" - nothing else]

"""
        else:
            # First message - ask what app should do
            instruction = """[INSTRUCTION: You are a receptionist. ONE short sentence. Ask what the app should do.]

"""

        user_message = instruction + request.message

        # Run agent with message and history
        result = await agent.run(user_message, message_history=message_history)

        # Build response
        usage = result.usage()

        # Extract tool names from tool calls
        tools_called = []
        for call in result.all_messages():
            if hasattr(call, 'parts'):
                for part in call.parts:
                    if hasattr(part, 'tool_name'):
                        tools_called.append(part.tool_name)

        # Parse handoff summary if present
        response_text, handoff_summary = parse_handoff_summary(result.output)
        handoff_ready = handoff_summary is not None

        # Log response
        print(f"AGENT: {response_text[:200]}..." if len(response_text) > 200 else f"AGENT: {response_text}")
        print(f"HANDOFF_READY: {handoff_ready}")
        print(f"{'='*50}\n")

        return ChatResponse(
            response=response_text,
            tokens_used=usage.total_tokens if usage else 0,
            tools_called=tools_called,
            handoff_ready=handoff_ready,
            handoff_summary=handoff_summary,
        )
    except Exception as e:
        # Log error in production
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.post("/lead", response_model=LeadResponse)
async def capture_lead(request: LeadRequest) -> LeadResponse:
    """
    Capture lead information from the form submission.

    Called when user submits the lead capture form after agreeing to handoff.
    """
    try:
        from features.leads.capture import execute_capture

        result = await execute_capture(
            name=request.name,
            email=request.email,
            conversation_summary=request.conversation_summary,
            inquiry_type=request.inquiry_type,  # type: ignore
        )

        return LeadResponse(
            success=result.success,
            reference_id=result.reference_id,
            message=result.message,
            error=result.error,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lead capture error: {str(e)}")


# ============ Entry Point ============

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.AGENT_PORT,
        reload=True,
    )
