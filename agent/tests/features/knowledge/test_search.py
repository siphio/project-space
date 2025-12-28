"""Tests for knowledge search functionality."""

import pytest
from features.knowledge.search import execute_search, _load_data, _calculate_score
from features.knowledge.models import KnowledgeResult


class TestDataLoading:
    """Test data loading from JSON files."""

    def test_load_data_returns_dict(self):
        """Data loading should return a dictionary."""
        data = _load_data()
        assert isinstance(data, dict)

    def test_load_data_contains_expected_keys(self):
        """Loaded data should contain all expected categories."""
        data = _load_data()
        expected_keys = ["apps", "services", "blog", "company"]
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"

    def test_apps_data_has_apps_list(self):
        """Apps data should contain apps list."""
        data = _load_data()
        apps = data.get("apps", {}).get("apps", [])
        assert len(apps) >= 3, "Should have at least 3 apps"

    def test_blog_data_has_posts_list(self):
        """Blog data should contain posts list."""
        data = _load_data()
        posts = data.get("blog", {}).get("posts", [])
        assert len(posts) >= 6, "Should have at least 6 blog posts"


class TestScoreCalculation:
    """Test fuzzy matching score calculation."""

    def test_exact_match_high_score(self):
        """Exact substring match should get high score."""
        score = _calculate_score("spending insights", "Spending Insights is an AI app")
        assert score >= 90

    def test_partial_match_moderate_score(self):
        """Partial match should get moderate score."""
        score = _calculate_score("spending", "Spending Insights app")
        assert score >= 60

    def test_no_match_low_score(self):
        """No match should get low score."""
        score = _calculate_score("xyz random", "Spending Insights app")
        assert score < 60


class TestAppSearch:
    """Test searching the app catalog."""

    @pytest.mark.asyncio
    async def test_search_spending_insights(self):
        """Should find Spending Insights app."""
        result = await execute_search("Spending Insights", category="apps")
        assert result.found
        assert len(result.results) > 0
        assert "Spending Insights" in result.results[0].title

    @pytest.mark.asyncio
    async def test_search_checklist_manager(self):
        """Should find Checklist Manager app."""
        result = await execute_search("Checklist Manager", category="apps")
        assert result.found
        assert any("Checklist" in r.title for r in result.results)

    @pytest.mark.asyncio
    async def test_search_ai_agents(self):
        """Should find AI Agents app."""
        result = await execute_search("AI Agents", category="apps")
        assert result.found
        assert any("AI Agents" in r.title for r in result.results)


class TestServicesSearch:
    """Test searching services catalog."""

    @pytest.mark.asyncio
    async def test_search_consulting(self):
        """Should find consulting service."""
        result = await execute_search("consulting", category="services")
        assert result.found
        assert len(result.results) > 0

    @pytest.mark.asyncio
    async def test_search_pricing(self):
        """Should find pricing information."""
        result = await execute_search("pricing", category="services")
        assert result.found
        assert any("Pricing" in r.title for r in result.results)

    @pytest.mark.asyncio
    async def test_search_ai_development(self):
        """Should find AI development service."""
        result = await execute_search("AI agent development", category="services")
        assert result.found


class TestBlogSearch:
    """Test searching blog posts."""

    @pytest.mark.asyncio
    async def test_search_ai_native(self):
        """Should find AI-native related posts."""
        result = await execute_search("AI-native", category="blog")
        assert result.found
        assert len(result.results) > 0

    @pytest.mark.asyncio
    async def test_search_hiring(self):
        """Should find hiring post."""
        result = await execute_search("hiring", category="blog")
        assert result.found


class TestCompanySearch:
    """Test searching company information."""

    @pytest.mark.asyncio
    async def test_search_mission(self):
        """Should find company mission."""
        result = await execute_search("mission", category="company")
        assert result.found

    @pytest.mark.asyncio
    async def test_search_technology(self):
        """Should find technology stack."""
        result = await execute_search("technology", category="company")
        assert result.found
        assert any("Technology" in r.title for r in result.results)


class TestSearchAllCategories:
    """Test searching across all categories."""

    @pytest.mark.asyncio
    async def test_search_all_categories(self):
        """Should search all categories when none specified."""
        result = await execute_search("AI")
        assert result.found
        assert result.category == "all"
        assert len(result.results) > 0

    @pytest.mark.asyncio
    async def test_search_no_results_gives_suggestion(self):
        """Should provide suggestion when no results found."""
        result = await execute_search("xyznonexistent123")
        assert not result.found
        assert result.suggestion is not None


class TestResponseFormats:
    """Test concise vs detailed response formats."""

    @pytest.mark.asyncio
    async def test_concise_format_shorter(self):
        """Concise format should be shorter than detailed."""
        concise = await execute_search("Spending Insights", response_format="concise")
        detailed = await execute_search("Spending Insights", response_format="detailed")

        assert concise.found and detailed.found
        concise_len = len(concise.results[0].content)
        detailed_len = len(detailed.results[0].content)
        assert detailed_len > concise_len


class TestKnowledgeResult:
    """Test KnowledgeResult model."""

    @pytest.mark.asyncio
    async def test_result_has_query(self):
        """Result should include original query."""
        result = await execute_search("test query")
        assert result.query == "test query"

    @pytest.mark.asyncio
    async def test_result_has_category(self):
        """Result should include category."""
        result = await execute_search("test", category="apps")
        assert result.category == "apps"
