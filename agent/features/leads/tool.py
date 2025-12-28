"""Pydantic AI tool for lead capture."""

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
