// 인메모리 Mock 저장소 (Supabase 없이 테스트용)
// globalThis를 사용하여 Next.js 모듈 경계를 넘어 데이터 공유

interface ResultRow {
  id: string;
  company_name: string;
  score: number;
  title_type: string;
  answers: number[];
  created_at: string;
}

interface ResignLetterRow {
  id: string;
  reason_hash: string;
  style: string;
  content: string;
  created_at: string;
}

interface MockStore {
  results: ResultRow[];
  resignLetters: ResignLetterRow[];
  seeded: boolean;
}

// globalThis에 저장소를 바인딩하여 모듈 경계를 넘어 공유
const globalStore = globalThis as unknown as { __mockStore?: MockStore };
if (!globalStore.__mockStore) {
  globalStore.__mockStore = {
    results: [],
    resignLetters: [],
    seeded: false,
  };
}
const store = globalStore.__mockStore;

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// 샘플 데이터 (랭킹 테스트용)
if (!store.seeded) {
  store.seeded = true;
  const companies = ['삼성전자', '네이버', 'LG전자', '카카오', 'SK하이닉스', '현대자동차'];
  const now = new Date().toISOString();
  for (const company of companies) {
    const count = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      store.results.push({
        id: generateId(),
        company_name: company,
        score: 20 + Math.floor(Math.random() * 70),
        title_type: '테스트',
        answers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
        created_at: now,
      });
    }
  }
}

// Supabase 호환 쿼리 빌더 Mock
class MockQueryBuilder<T> {
  private table: string;
  private filters: Array<{ column: string; value: unknown }> = [];
  private selectColumns = '*';
  private isSingle = false;
  private isMaybeSingle = false;
  private insertData: Partial<T> | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*') {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this.execute();
  }

  insert(data: Partial<T>) {
    this.insertData = data;
    return this;
  }

  order(column: string, options?: { ascending: boolean }) {
    void column;
    void options;
    return this;
  }

  limit(count: number) {
    void count;
    return this;
  }

  private getStore(): unknown[] {
    if (this.table === 'results') return store.results;
    if (this.table === 'resign_letters') return store.resignLetters;
    return [];
  }

  async execute(): Promise<{ data: T | T[] | null; error: null }> {
    // INSERT
    if (this.insertData) {
      const id = generateId();
      const row = {
        id,
        ...this.insertData,
        created_at: new Date().toISOString(),
      };
      this.getStore().push(row);

      if (this.selectColumns) {
        return { data: row as T, error: null };
      }
      return { data: null, error: null };
    }

    // SELECT
    let rows = [...this.getStore()] as Record<string, unknown>[];
    for (const f of this.filters) {
      rows = rows.filter((r) => r[f.column] === f.value);
    }

    if (this.isSingle || this.isMaybeSingle) {
      return { data: (rows[0] as T) ?? null, error: null };
    }

    return { data: rows as T[], error: null };
  }

  then(resolve: (value: { data: T | T[] | null; error: null }) => void) {
    return this.execute().then(resolve);
  }
}

// Mock Supabase Client
export const mockSupabase = {
  from(table: string) {
    return new MockQueryBuilder(table);
  },
};
