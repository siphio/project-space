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


def is_informational_query(message: str) -> bool:
    """
    Detect if the user is asking an informational question about Siphio.

    These queries should use the knowledge base tool, not the app-building flow.
    """
    message_lower = message.lower()

    # Keywords that indicate informational queries
    info_keywords = [
        # Questions about Siphio
        'what is siphio', 'who is siphio', 'tell me about siphio', 'about siphio',
        'what do you do', 'what does siphio do', 'what do you offer',
        # News/updates
        'news', 'latest', 'update', 'announcement', 'new at', 'what\'s new',
        'recent', 'happening',
        # Apps
        'spending insights', 'checklist manager', 'ai agents',
        'your apps', 'your products', 'what apps',
        # Services
        'services', 'offer', 'hire', 'hiring', 'jobs', 'careers', 'work with',
        # Company
        'team', 'founded', 'mission', 'values', 'tech stack', 'technology',
        # Blog
        'blog', 'article', 'post', 'read about', 'written about',
        # General questions
        'how does', 'can you tell', 'do you have', 'what are',
    ]

    return any(keyword in message_lower for keyword in info_keywords)


def is_app_building_intent(message: str, history: list[MessageHistoryItem]) -> bool:
    """
    Detect if the user wants to build/create an app.
    """
    message_lower = message.lower()

    # Direct app-building keywords
    build_keywords = [
        'build', 'create', 'make', 'develop', 'need an app', 'want an app',
        'i want a', 'i need a', 'looking for an app', 'app for my',
    ]

    # Check current message
    if any(keyword in message_lower for keyword in build_keywords):
        return True

    # Check if we're already in an app-building conversation
    for msg in history:
        if msg.role == "user":
            content_lower = msg.content.lower()
            if any(keyword in content_lower for keyword in build_keywords):
                return True

    return False


def is_new_app_building_request(message: str) -> bool:
    """
    Detect if the CURRENT message is starting a new app-building request.

    This is different from is_app_building_intent - this only checks the current
    message, not history. Used to reset the app-building flow when user switches topics.
    """
    message_lower = message.lower()

    # Keywords that indicate starting a new app request
    new_app_keywords = [
        'i want to build', 'i want a', 'i need a', 'i need an app',
        'can you build', 'can you make', 'can you create',
        'build me a', 'create a', 'make a', 'develop a',
        'looking for an app', 'need an app for',
    ]

    return any(keyword in message_lower for keyword in new_app_keywords)


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

        user_lower = request.message.lower().strip()

        # Check if this is an informational query (should use knowledge tool)
        if is_informational_query(request.message) and not is_app_building_intent(request.message, request.conversation_history):
            print("MODE: Informational query - using knowledge base")

            # Let the agent handle it naturally with tools
            result = await agent.run(request.message, message_history=message_history)
            usage = result.usage()

            # Extract tool names
            tools_called = []
            for call in result.all_messages():
                if hasattr(call, 'parts'):
                    for part in call.parts:
                        if hasattr(part, 'tool_name'):
                            tools_called.append(part.tool_name)

            response_text, handoff_summary = parse_handoff_summary(result.output)

            print(f"AGENT: {response_text[:200]}..." if len(response_text) > 200 else f"AGENT: {response_text}")
            print(f"TOOLS: {tools_called}")
            print(f"{'='*50}\n")

            return ChatResponse(
                response=response_text,
                tokens_used=usage.total_tokens if usage else 0,
                tools_called=tools_called,
                handoff_ready=False,
                handoff_summary=None,
            )

        # ===== APP BUILDING FLOW =====
        print("MODE: App building flow")

        # Check if this is a NEW app-building request (user switching topics)
        is_new_request = is_new_app_building_request(request.message)

        if is_new_request:
            print("  -> NEW app request detected, resetting flow")

        # Extract info from conversation - but ONLY from app-building context
        # If this is a new request, we start fresh
        app_features = ""
        platform = ""
        app_type = ""

        # Extract app type from current message if it's a new request
        if is_new_request:
            # Extract what type of app from current message
            # e.g., "I want to build a gym app" -> "gym app"
            message_lower = request.message.lower()
            for word in ['gym', 'restaurant', 'fitness', 'food', 'delivery', 'booking', 'scheduling', 'todo', 'task', 'finance', 'health', 'social', 'ecommerce', 'shopping']:
                if word in message_lower:
                    app_type = word + " app"
                    break
        else:
            # Continue from previous app-building conversation
            # Check history first
            for msg in request.conversation_history:
                if msg.role == "user" and len(msg.content) > 5:
                    content_lower = msg.content.lower()
                    if not app_features and any(word in content_lower for word in ['track', 'manage', 'show', 'workout', 'subscription', 'member', 'book', 'order', 'schedule', 'display', 'list', 'monitor']):
                        app_features = msg.content
                    if not platform and any(word in content_lower for word in ['phone', 'mobile', 'ios', 'android', 'website', 'web']):
                        platform = "phone" if any(w in content_lower for w in ['phone', 'mobile', 'ios', 'android']) else "website"

            # Also check CURRENT message for features/platform (user might be answering the "what features" question)
            current_lower = request.message.lower()
            feature_keywords = ['track', 'manage', 'show', 'workout', 'subscription', 'member', 'book', 'order', 'schedule', 'display', 'list', 'monitor', 'busy', 'notification', 'alert', 'remind']
            if not app_features and any(word in current_lower for word in feature_keywords):
                app_features = request.message
            if not platform and any(word in current_lower for word in ['phone', 'mobile', 'ios', 'android', 'website', 'web']):
                platform = "phone" if any(w in current_lower for w in ['phone', 'mobile', 'ios', 'android']) else "website"

        if app_features or platform:
            print(f"  -> Extracted: features='{app_features[:50] + '...' if len(app_features) > 50 else app_features}', platform='{platform}'")

        # Check if user is confirming handoff
        is_affirmative = user_lower in ['yes', 'yeah', 'sure', 'yep', 'ok', 'okay', 'yes please', 'yes, please', 'y', 'yea']

        # Check if last message asked about handoff
        last_asked_handoff = False
        if request.conversation_history and not is_new_request:
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

        # If this is a new request, always start by asking about features
        if is_new_request:
            print(f"  -> Asking about features for: {app_type or 'the app'}")
            instruction = f"""[INSTRUCTION: The user wants to build a {app_type or 'new app'}. In ONE friendly short sentence, ask what features they want it to have. Example: "A gym app, nice! What would you want it to do?"]

"""
        # Check if we should ask about handoff (have features + platform)
        elif platform and app_features:
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

        elif platform or any(word in user_lower for word in ['phone', 'mobile', 'website', 'web', 'ios', 'android']):
            # User just said phone/website - ask for handoff
            summary = f"App for {platform or user_lower} - {app_features or 'custom app'}"

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

        elif app_features:
            # Have features, ask about platform
            instruction = """[INSTRUCTION: Say ONLY this: "Phone app or website?" - nothing else]

"""
        else:
            # No features yet - ask what app should do
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
