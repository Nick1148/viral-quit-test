import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { mockSupabase } from './mock-store';

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url';

let _supabase: SupabaseClient | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): any {
  if (isMockMode) {
    return mockSupabase;
  }
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _supabase;
}

export function getServiceClient() {
  if (isMockMode) return mockSupabase;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
