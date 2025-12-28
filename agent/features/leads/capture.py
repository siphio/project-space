"""Lead capture business logic."""

import uuid
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING

from .models import LeadResult, InquiryType
from .validation import validate_email, validate_name

if TYPE_CHECKING:
    from postgrest import SyncPostgrestClient


def _get_postgrest() -> "SyncPostgrestClient":
    """Lazy import of postgrest client to avoid circular imports."""
    from database.client import postgrest
    return postgrest


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

    postgrest = _get_postgrest()
    result = (
        postgrest.from_("leads")
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

    postgrest = _get_postgrest()
    postgrest.from_("leads").insert({
        "name": name.strip(),
        "email": email.lower().strip(),
        "conversation_summary": conversation_summary,
        "inquiry_type": inquiry_type,
        "is_duplicate": is_duplicate,
        "reference_id": reference_id,
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
