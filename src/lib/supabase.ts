import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

export function subscribeSupabaseRealtime(onChange: () => void): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('nuam-realtime-updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tax_qualifications' },
      () => onChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'dj1948_batches' },
      () => onChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'audit_logs' },
      () => onChange()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
