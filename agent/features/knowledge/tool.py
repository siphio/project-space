"""Pydantic AI tool for knowledge base search."""

from typing import Optional

from pydantic_ai import RunContext

from core.agent import agent
from .models import KnowledgeResult, CategoryType, ResponseFormat
from .search import execute_search


@agent.tool
async def search_knowledge_base(
    ctx: RunContext[None],
    query: str,
    category: Optional[CategoryType] = None,
    response_format: ResponseFormat = "concise",
) -> KnowledgeResult:
    """Search Siphio's knowledge base for accurate business information.

    Use this tool to find information about Siphio's products, services,
    blog content, and company details. ALWAYS use this tool instead of
    guessing or making up information about Siphio.

    Args:
        query: Natural language search query describing what to find
        category: Optional filter - "apps" for products, "services" for
                  consulting offerings, "blog" for articles, "company" for
                  mission and team info. Leave empty to search all.
        response_format: "concise" for brief answers (default),
                        "detailed" for comprehensive information

    Returns:
        KnowledgeResult containing matching results or suggestions
    """
    return await execute_search(query, category, response_format)
