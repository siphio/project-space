"""Supabase/PostgREST client initialization."""

from postgrest import SyncPostgrestClient

from core.config import settings


def get_postgrest_client() -> SyncPostgrestClient:
    """Get PostgREST client instance.

    Returns:
        Configured PostgREST client for Supabase
    """
    return SyncPostgrestClient(
        base_url=f"{settings.SUPABASE_URL}/rest/v1",
        headers={
            "apikey": settings.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
        },
    )


# Singleton client instance
postgrest: SyncPostgrestClient = get_postgrest_client()
