import os
from functools import lru_cache
from typing import Optional
from supabase import Client, create_client


@lru_cache(maxsize=1)
def get_supabase_client() -> Optional[Client]:
    url = os.environ.get('SUPABASE_URL', '').strip()
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()
    if not url or not key:
        return None
    return create_client(url, key)


def sync_audit_to_supabase(payload: dict) -> None:
    """Replica asíncrona opcional hacia la tabla audit_logs de Supabase."""
    client = get_supabase_client()
    if not client:
        return
    try:
        client.table('audit_logs').insert(payload).execute()
    except Exception:
        # La persistencia principal ya queda garantizada en PostgreSQL vía ORM Django
        pass
