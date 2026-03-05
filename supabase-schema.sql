-- 퇴사연구소 DB 스키마 (Supabase에서 SQL Editor로 실행)

-- 결과 테이블
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  title_type TEXT NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사직서 캐시 테이블
CREATE TABLE resign_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reason_hash TEXT NOT NULL,
  style TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_results_company ON results(company_name);
CREATE INDEX idx_resign_hash ON resign_letters(reason_hash);

-- RLS 활성화 (Supabase 필수)
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE resign_letters ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능 (익명 서비스이므로)
CREATE POLICY "Allow all reads on results" ON results FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on results" ON results FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all reads on resign_letters" ON resign_letters FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on resign_letters" ON resign_letters FOR INSERT WITH CHECK (true);

-- 회사별 통계 뷰 (Materialized View 대신 일반 View 사용 - Supabase 호환)
CREATE OR REPLACE VIEW company_stats AS
SELECT
  company_name,
  COUNT(*) as participant_count,
  ROUND(AVG(score)::numeric, 1) as avg_score
FROM results
GROUP BY company_name
HAVING COUNT(*) >= 3;

-- 회사별 통계를 RPC 함수로도 제공 (더 유연한 조회)
CREATE OR REPLACE FUNCTION get_company_stats()
RETURNS TABLE(company_name TEXT, participant_count BIGINT, avg_score NUMERIC) AS $$
  SELECT
    company_name,
    COUNT(*) as participant_count,
    ROUND(AVG(score)::numeric, 1) as avg_score
  FROM results
  GROUP BY company_name
  HAVING COUNT(*) >= 3
  ORDER BY avg_score DESC
  LIMIT 50;
$$ LANGUAGE SQL STABLE;

-- 특정 회사의 통계 + 순위 조회 함수
CREATE OR REPLACE FUNCTION get_company_rank(target_company TEXT, target_score INTEGER)
RETURNS TABLE(avg_score NUMERIC, participant_count BIGINT, rank_percent NUMERIC) AS $$
  SELECT
    ROUND(AVG(score)::numeric, 1) as avg_score,
    COUNT(*) as participant_count,
    ROUND(
      (COUNT(*) FILTER (WHERE score >= target_score)::numeric / GREATEST(COUNT(*), 1) * 100)::numeric,
      1
    ) as rank_percent
  FROM results
  WHERE company_name = target_company;
$$ LANGUAGE SQL STABLE;
