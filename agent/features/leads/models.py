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
