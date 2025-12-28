"""Tests for lead capture logic."""

import pytest
from unittest.mock import patch, MagicMock

from features.leads.models import LeadResult
from features.leads.capture import execute_capture, _generate_reference_id


class TestReferenceIdGeneration:
    """Test reference ID generation."""

    def test_reference_id_format(self):
        """Reference ID should have correct format."""
        ref_id = _generate_reference_id()
        assert ref_id.startswith("SIPH-")
        assert len(ref_id) == 13  # SIPH- + 8 chars

    def test_reference_id_uppercase(self):
        """Reference ID should be uppercase."""
        ref_id = _generate_reference_id()
        # The hex part after SIPH- should be uppercase
        hex_part = ref_id.split("-")[1]
        assert hex_part == hex_part.upper()

    def test_reference_id_unique(self):
        """Reference IDs should be unique."""
        ids = [_generate_reference_id() for _ in range(100)]
        assert len(set(ids)) == 100


class TestExecuteCapture:
    """Test lead capture execution."""

    @pytest.mark.asyncio
    async def test_invalid_email_returns_error(self):
        """Invalid email should return error result."""
        result = await execute_capture(
            name="John Doe",
            email="invalid-email",
            conversation_summary="Test summary",
        )
        assert result.success is False
        assert result.error is not None
        assert "email" in result.error.lower()

    @pytest.mark.asyncio
    async def test_invalid_name_returns_error(self):
        """Invalid name should return error result."""
        result = await execute_capture(
            name="",
            email="test@example.com",
            conversation_summary="Test summary",
        )
        assert result.success is False
        assert result.error is not None
        assert "required" in result.error.lower()

    @pytest.mark.asyncio
    async def test_short_name_returns_error(self):
        """Single character name should return error."""
        result = await execute_capture(
            name="J",
            email="test@example.com",
            conversation_summary="Test summary",
        )
        assert result.success is False
        assert result.error is not None

    @pytest.mark.asyncio
    @patch("features.leads.capture._get_postgrest")
    async def test_successful_capture(self, mock_get_postgrest):
        """Successful capture should return success result."""
        # Mock the table operations
        mock_postgrest = MagicMock()
        mock_get_postgrest.return_value = mock_postgrest
        mock_table = MagicMock()
        mock_postgrest.from_.return_value = mock_table
        mock_table.select.return_value.eq.return_value.gte.return_value.limit.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        result = await execute_capture(
            name="John Doe",
            email="john@example.com",
            conversation_summary="Interested in AI development",
            inquiry_type="freelance_project",
        )

        assert result.success is True
        assert result.reference_id is not None
        assert result.reference_id.startswith("SIPH-")
        assert "John" in result.message
        assert result.is_duplicate is False

    @pytest.mark.asyncio
    @patch("features.leads.capture._get_postgrest")
    async def test_duplicate_detection(self, mock_get_postgrest):
        """Duplicate email should be flagged."""
        mock_postgrest = MagicMock()
        mock_get_postgrest.return_value = mock_postgrest
        mock_table = MagicMock()
        mock_postgrest.from_.return_value = mock_table
        # Return existing lead (simulating duplicate)
        mock_table.select.return_value.eq.return_value.gte.return_value.limit.return_value.execute.return_value.data = [{"id": "123"}]
        mock_table.insert.return_value.execute.return_value = MagicMock()

        result = await execute_capture(
            name="John Doe",
            email="john@example.com",
            conversation_summary="Another inquiry",
        )

        assert result.success is True
        assert result.is_duplicate is True
        assert "already have" in result.message.lower()

    @pytest.mark.asyncio
    @patch("features.leads.capture._get_postgrest")
    async def test_database_error_handled(self, mock_get_postgrest):
        """Database error should return error result."""
        mock_postgrest = MagicMock()
        mock_get_postgrest.return_value = mock_postgrest
        mock_table = MagicMock()
        mock_postgrest.from_.return_value = mock_table
        mock_table.select.return_value.eq.return_value.gte.return_value.limit.return_value.execute.return_value.data = []
        # Simulate database error
        mock_table.insert.return_value.execute.side_effect = Exception("DB connection failed")

        result = await execute_capture(
            name="John Doe",
            email="john@example.com",
            conversation_summary="Test",
        )

        assert result.success is False
        assert result.error is not None
        assert "DB connection failed" in result.error


class TestLeadResult:
    """Test LeadResult model."""

    def test_success_result(self):
        """Success result should have expected fields."""
        result = LeadResult(
            success=True,
            reference_id="SIPH-12345678",
            message="Lead captured",
            is_duplicate=False,
        )
        assert result.success is True
        assert result.reference_id == "SIPH-12345678"
        assert result.error is None

    def test_error_result(self):
        """Error result should have expected fields."""
        result = LeadResult(
            success=False,
            message="Could not capture",
            error="Invalid email format",
        )
        assert result.success is False
        assert result.reference_id is None
        assert result.error == "Invalid email format"
