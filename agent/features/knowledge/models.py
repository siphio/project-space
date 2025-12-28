"""Data models for knowledge search feature."""

from typing import Optional, Literal
from pydantic import BaseModel, Field


# Category type for filtering
CategoryType = Literal["apps", "services", "blog", "company"]

# Response format type
ResponseFormat = Literal["concise", "detailed"]


class SearchResultItem(BaseModel):
    """Single search result item."""

    title: str = Field(..., description="Title of the matched content")
    content: str = Field(..., description="Relevant content snippet or full content")
    relevance: str = Field(..., description="Why this result matches the query")
    source: str = Field(..., description="Category and identifier of source")
    score: float = Field(ge=0, le=100, description="Match score 0-100")


class KnowledgeResult(BaseModel):
    """Result from knowledge base search."""

    found: bool = Field(..., description="Whether any results were found")
    category: str = Field(..., description="Category searched or 'all'")
    results: list[SearchResultItem] = Field(
        default_factory=list, description="List of matching results"
    )
    suggestion: Optional[str] = Field(
        None, description="Suggestion if no results found"
    )
    query: str = Field(..., description="Original search query")
