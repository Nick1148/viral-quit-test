import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { mockSupabase } from './mock-store';

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url';

if (isMockMode && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL 이 없어 인메모리 Mock 저장소로 동작합니다. 데이터가 유지되지 않습니다.');
}

let _supabase: SupabaseClient | null = null;

// 서버 전용 클라이언트. 모든 DB 접근은 API 라우트/서버 컴포넌트에서만 일어난다.
// SUPABASE_SERVICE_ROLE_KEY 가 있으면 그것을 쓰고(익명 키의 쓰기 권한을 막을 수 있도록),
// 없으면 기존처럼 익명 키로 동작한다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): any {
  if (isMockMode) {
    return mockSupabase;
  }
  if (!_supabase) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
}

// Supabase 는 요청당 최대 행 수(max_rows, 기본 1000)를 넘는 결과를 잘라서 준다.
// 집계용으로 전체 행이 필요할 때 range 로 나눠 끝까지 읽는다.
const PAGE_SIZE = 1000;
const MAX_PAGES = 100;

export async function fetchAllRows<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildQuery: () => any,
): Promise<{ data: T[]; error: { message: string } | null }> {
  const rows: T[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE_SIZE;
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    const chunk = (data ?? []) as T[];
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
  }
  return { data: rows, error: null };
}
