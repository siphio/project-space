"""Search logic for knowledge base."""

import json
from pathlib import Path
from typing import Optional

from rapidfuzz import fuzz

from .models import KnowledgeResult, SearchResultItem, CategoryType, ResponseFormat


# Path to data directory
DATA_DIR = Path(__file__).parent / "data"

# Cached data (loaded once)
_cache: dict = {}


def _load_data() -> dict:
    """Load all knowledge data files into cache."""
    if _cache:
        return _cache

    for filename in ["apps.json", "services.json", "blog_index.json", "company.json"]:
        filepath = DATA_DIR / filename
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                key = filename.replace(".json", "").replace("_index", "")
                _cache[key] = json.load(f)

    return _cache


def _calculate_score(query: str, text: str) -> float:
    """Calculate match score using fuzzy matching."""
    query_lower = query.lower()
    text_lower = text.lower()

    # Exact substring match gets high score
    if query_lower in text_lower:
        return 95.0

    # Use partial ratio for fuzzy matching
    return fuzz.partial_ratio(query_lower, text_lower)


def _search_apps(query: str, response_format: ResponseFormat) -> list[SearchResultItem]:
    """Search app catalog."""
    data = _load_data()
    apps = data.get("apps", {}).get("apps", [])
    results = []

    for app in apps:
        # Build searchable text
        searchable = f"{app['name']} {app['tagline']} {app['description']} {' '.join(app.get('features', []))}"
        score = _calculate_score(query, searchable)

        if score >= 60:
            if response_format == "concise":
                content = f"{app['tagline']}. {app['description'][:150]}..."
            else:
                content = (
                    f"**{app['name']}**: {app['tagline']}\n\n"
                    f"{app['description']}\n\n"
                    f"**Tech Stack**: {', '.join(app['tech_stack'])}\n\n"
                    f"**Why Built**: {app['why_built']}"
                )

            results.append(
                SearchResultItem(
                    title=app["name"],
                    content=content,
                    relevance=f"Matched on app name/description (score: {score:.0f})",
                    source=f"apps/{app['slug']}",
                    score=score,
                )
            )

    return results


def _search_services(query: str, response_format: ResponseFormat) -> list[SearchResultItem]:
    """Search services catalog."""
    data = _load_data()
    services_data = data.get("services", {})
    services = services_data.get("services", [])
    results = []

    for service in services:
        searchable = f"{service['name']} {service['description']} {' '.join(service.get('ideal_for', []))}"
        score = _calculate_score(query, searchable)

        if score >= 60:
            if response_format == "concise":
                content = service["description"][:200]
            else:
                content = (
                    f"**{service['name']}**\n\n"
                    f"{service['description']}\n\n"
                    f"**Deliverables**: {', '.join(service['deliverables'])}\n\n"
                    f"**Ideal For**: {', '.join(service['ideal_for'])}\n\n"
                    f"**Approach**: {service['approach']}"
                )

            results.append(
                SearchResultItem(
                    title=service["name"],
                    content=content,
                    relevance=f"Matched on service offering (score: {score:.0f})",
                    source=f"services/{service['name'].lower().replace(' ', '-')}",
                    score=score,
                )
            )

    # Also check pricing approach
    pricing = services_data.get("pricing_approach", "")
    if _calculate_score(query, f"pricing cost price {pricing}") >= 60:
        results.append(
            SearchResultItem(
                title="Pricing Approach",
                content=pricing,
                relevance="Matched on pricing query",
                source="services/pricing",
                score=85.0,
            )
        )

    return results


def _search_blog(query: str, response_format: ResponseFormat) -> list[SearchResultItem]:
    """Search blog posts."""
    data = _load_data()
    posts = data.get("blog", {}).get("posts", [])
    results = []

    for post in posts:
        topics = " ".join(post.get("topics", []))
        searchable = f"{post['title']} {post['excerpt']} {post['category']} {topics}"
        score = _calculate_score(query, searchable)

        if score >= 60:
            if response_format == "concise":
                content = post["excerpt"][:200]
            else:
                content = (
                    f"**{post['title']}**\n\n"
                    f"{post['excerpt']}\n\n"
                    f"**Category**: {post['category']}\n"
                    f"**Published**: {post['published_at']}\n"
                    f"**Author**: {post['author']}"
                )

            results.append(
                SearchResultItem(
                    title=post["title"],
                    content=content,
                    relevance=f"Matched on blog content (score: {score:.0f})",
                    source=f"blog/{post['slug']}",
                    score=score,
                )
            )

    return results


def _search_company(query: str, response_format: ResponseFormat) -> list[SearchResultItem]:
    """Search company information."""
    data = _load_data()
    company_data = data.get("company", {})
    company = company_data.get("company", {})
    tech = company_data.get("technology", {})
    values = company_data.get("values", [])
    results = []

    # Search company info
    company_text = f"about siphio mission {company.get('name', '')} {company.get('mission', '')} {company.get('philosophy', '')}"
    if _calculate_score(query, company_text) >= 60:
        if response_format == "concise":
            content = company.get("mission", "")
        else:
            content = (
                f"**{company.get('name', 'Siphio AI')}**: {company.get('tagline', '')}\n\n"
                f"**Mission**: {company.get('mission', '')}\n\n"
                f"**Philosophy**: {company.get('philosophy', '')}\n\n"
                f"**Founded**: {company.get('founded', '')} | "
                f"**Location**: {company.get('location', '')} | "
                f"**Team**: {company.get('team_size', '')}"
            )

        results.append(
            SearchResultItem(
                title="About Siphio AI",
                content=content,
                relevance="Matched on company information",
                source="company/about",
                score=90.0,
            )
        )

    # Search technology
    tech_text = f"technology tech stack {' '.join(tech.get('frontend', []))} {' '.join(tech.get('backend', []))} {' '.join(tech.get('ai', []))}"
    if _calculate_score(query, tech_text) >= 60:
        if response_format == "concise":
            all_tech = tech.get("frontend", []) + tech.get("backend", []) + tech.get("ai", [])
            content = f"Tech stack: {', '.join(all_tech)}"
        else:
            content = (
                f"**Frontend**: {', '.join(tech.get('frontend', []))}\n"
                f"**Backend**: {', '.join(tech.get('backend', []))}\n"
                f"**AI**: {', '.join(tech.get('ai', []))}\n"
                f"**Infrastructure**: {', '.join(tech.get('infrastructure', []))}\n\n"
                f"**Approach**: {tech.get('approach', '')}"
            )

        results.append(
            SearchResultItem(
                title="Technology Stack",
                content=content,
                relevance="Matched on technology query",
                source="company/technology",
                score=88.0,
            )
        )

    # Search values
    values_text = " ".join(values)
    if _calculate_score(query, f"values principles culture {values_text}") >= 60:
        results.append(
            SearchResultItem(
                title="Our Values",
                content="\n".join(f"• {v}" for v in values),
                relevance="Matched on company values",
                source="company/values",
                score=85.0,
            )
        )

    return results


def _get_suggestion(query: str, category: Optional[str]) -> str:
    """Generate helpful suggestion when no results found."""
    suggestions = [
        "Try asking about our apps: Spending Insights, Checklist Manager, or AI Agents",
        "Ask about our services: AI development, consulting, or full-stack development",
        "Check out our blog for articles about AI-native applications",
        "Ask about our company, team, or technology stack",
    ]

    if category == "apps":
        return "Try asking about Spending Insights, Checklist Manager, or AI Agents specifically."
    elif category == "services":
        return "Try asking about AI agent development, consulting, or pricing."
    elif category == "blog":
        return "Try asking about specific topics like AI-native apps, hiring, or our roadmap."
    elif category == "company":
        return "Try asking about our mission, team, values, or technology stack."

    return "I couldn't find specific information about that. " + suggestions[0]


async def execute_search(
    query: str,
    category: Optional[CategoryType] = None,
    response_format: ResponseFormat = "concise",
) -> KnowledgeResult:
    """
    Execute search across knowledge base.

    Args:
        query: Natural language search query
        category: Optional filter - "apps", "services", "blog", "company"
        response_format: "concise" or "detailed"

    Returns:
        KnowledgeResult with matching results or suggestions
    """
    all_results: list[SearchResultItem] = []

    # Search specified category or all
    if category is None or category == "apps":
        all_results.extend(_search_apps(query, response_format))
    if category is None or category == "services":
        all_results.extend(_search_services(query, response_format))
    if category is None or category == "blog":
        all_results.extend(_search_blog(query, response_format))
    if category is None or category == "company":
        all_results.extend(_search_company(query, response_format))

    # Sort by score and limit results
    all_results.sort(key=lambda x: x.score, reverse=True)
    top_results = all_results[:5]

    # Build result
    found = len(top_results) > 0
    suggestion = None if found else _get_suggestion(query, category)

    return KnowledgeResult(
        found=found,
        category=category or "all",
        results=top_results,
        suggestion=suggestion,
        query=query,
    )
