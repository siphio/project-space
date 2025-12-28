"""Tests for lead validation."""

import pytest

from features.leads.validation import validate_email, validate_name


class TestEmailValidation:
    """Test email validation."""

    def test_valid_email(self):
        """Valid email should pass."""
        valid, error = validate_email("test@example.com")
        assert valid is True
        assert error is None

    def test_valid_email_with_dots(self):
        """Email with dots should pass."""
        valid, error = validate_email("first.last@example.co.uk")
        assert valid is True

    def test_valid_email_with_plus(self):
        """Email with plus sign should pass."""
        valid, error = validate_email("test+tag@example.com")
        assert valid is True

    def test_invalid_email_no_at(self):
        """Email without @ should fail."""
        valid, error = validate_email("testexample.com")
        assert valid is False
        assert "Invalid email" in error

    def test_invalid_email_no_domain(self):
        """Email without domain should fail."""
        valid, error = validate_email("test@")
        assert valid is False

    def test_invalid_email_empty(self):
        """Empty email should fail."""
        valid, error = validate_email("")
        assert valid is False
        assert "required" in error.lower()

    def test_invalid_email_whitespace_only(self):
        """Whitespace-only email should fail."""
        valid, error = validate_email("   ")
        assert valid is False

    def test_email_whitespace_stripped(self):
        """Email whitespace should be handled."""
        valid, error = validate_email("  test@example.com  ")
        assert valid is True


class TestNameValidation:
    """Test name validation."""

    def test_valid_name(self):
        """Valid name should pass."""
        valid, error = validate_name("John Doe")
        assert valid is True
        assert error is None

    def test_valid_name_two_chars(self):
        """Two character name should pass."""
        valid, error = validate_name("Jo")
        assert valid is True

    def test_name_too_short(self):
        """Single character name should fail."""
        valid, error = validate_name("J")
        assert valid is False
        assert "at least 2" in error

    def test_empty_name(self):
        """Empty name should fail."""
        valid, error = validate_name("")
        assert valid is False
        assert "required" in error.lower()

    def test_name_whitespace_only(self):
        """Whitespace-only name should fail."""
        valid, error = validate_name("   ")
        assert valid is False

    def test_name_whitespace_stripped(self):
        """Name with leading/trailing whitespace should be handled."""
        valid, error = validate_name("  John Doe  ")
        assert valid is True

    def test_name_too_long(self):
        """Name over 100 chars should fail."""
        long_name = "A" * 101
        valid, error = validate_name(long_name)
        assert valid is False
        assert "less than 100" in error
