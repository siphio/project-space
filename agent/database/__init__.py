"""Database configuration for Siphio AI Agent.

Uses Supabase for:
- Lead storage
- Conversation logging (future)
"""

from .client import postgrest, get_postgrest_client

__all__ = ["postgrest", "get_postgrest_client"]
