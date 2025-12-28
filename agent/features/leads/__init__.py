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
