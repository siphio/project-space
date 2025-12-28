"""Knowledge search feature slice.

Provides the search_knowledge_base tool for the AI agent to query
Siphio's business information from structured JSON files.
"""

from .models import KnowledgeResult, SearchResultItem
from .search import execute_search

# Note: search_knowledge_base is registered directly on the agent
# via @agent.tool decorator in tool.py. Import it separately to avoid
# circular imports when importing just models/search.

__all__ = [
    "KnowledgeResult",
    "SearchResultItem",
    "execute_search",
]


def get_tool():
    """Get the search_knowledge_base tool (lazy import to avoid circular deps)."""
    from .tool import search_knowledge_base
    return search_knowledge_base
