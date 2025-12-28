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

# Register tools from feature slices
# Tool registration happens via @agent.tool decorator when imported

# NOTE: ALL TOOLS DISABLED for simpler conversations
# The knowledge base was adding technical jargon to responses
# from features.knowledge.tool import search_knowledge_base  # noqa: F401, E402

# NOTE: capture_lead tool is DISABLED - leads are now captured via the frontend form
# The agent uses [HANDOFF_SUMMARY] markers to trigger the form instead
# from features.leads.tool import capture_lead  # noqa: F401, E402
