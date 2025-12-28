"""Tests for the FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_health_returns_200(self, client):
        """Health endpoint should return 200."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_returns_status(self, client):
        """Health endpoint should return status."""
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "siphio-agent"


class TestChatEndpoint:
    """Test the chat endpoint."""

    def test_chat_requires_message(self, client):
        """Chat endpoint should require a message."""
        response = client.post("/chat", json={})
        assert response.status_code == 422  # Validation error

    def test_chat_validates_message_length(self, client):
        """Chat endpoint should validate message length."""
        response = client.post("/chat", json={"message": ""})
        assert response.status_code == 422

    def test_chat_accepts_valid_request(self, client):
        """Chat endpoint should accept valid request format."""
        # Note: This test checks request validation, not actual LLM response
        # Full integration tests would require API key
        response = client.post("/chat", json={"message": "Hello"})
        # Will fail without valid API key, but should not be a validation error
        assert response.status_code in [200, 500]

    def test_chat_accepts_conversation_history(self, client):
        """Chat endpoint should accept conversation history."""
        request = {
            "message": "Hello",
            "conversation_history": [
                {"role": "user", "content": "Hi"},
                {"role": "assistant", "content": "Hello!"}
            ]
        }
        response = client.post("/chat", json=request)
        # Will fail without valid API key, but should not be a validation error
        assert response.status_code in [200, 500]

    def test_chat_validates_history_role(self, client):
        """Chat endpoint should validate history roles."""
        request = {
            "message": "Hello",
            "conversation_history": [
                {"role": "invalid_role", "content": "Hi"}
            ]
        }
        response = client.post("/chat", json=request)
        assert response.status_code == 422
