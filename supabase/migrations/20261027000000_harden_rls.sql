-- 퇴사연구소 보안 강화 마이그레이션 (2026-10-27 점검)
--
-- 적용 전 반드시: Vercel 환경변수에 SUPABASE_SERVICE_ROLE_KEY 를 등록하고 재배포할 것.
-- 서버(API 라우트)는 service_role 키로 접근하므로 RLS 를 우회한다.
-- 이 파일을 적용하면 브라우저에 공개되는 anon 키로는 더 이상 테이블을 읽거나 쓸 수 없다.
--
-- 기존 정책의 문제:
--   * results: anon 키만 있으면 누구나 전체 행(회사명·답안 포함)을 내려받고, 점수를 조작한 행을 넣을 수 있었다.
--   * resign_letters: anon 키로 아무 내용이나 캐시에 넣어 다른 사용자에게 보이게 할 수 있었다(캐시 오염).

DROP POLICY IF EXISTS "Allow all reads on results" ON results;
DROP POLICY IF EXISTS "Allow all inserts on results" ON results;
DROP POLICY IF EXISTS "Allow all reads on resign_letters" ON resign_letters;
DROP POLICY IF EXISTS "Allow all inserts on resign_letters" ON resign_letters;

-- 데이터 무결성: 서버 검증과 같은 범위
ALTER TABLE results
  ADD CONSTRAINT results_score_range CHECK (score BETWEEN 0 AND 100) NOT VALID,
  ADD CONSTRAINT results_company_name_length CHECK (char_length(company_name) BETWEEN 1 AND 30) NOT VALID;

-- 사직서 캐시 조회는 (reason_hash, style) 로 한다
CREATE INDEX IF NOT EXISTS idx_resign_hash_style ON resign_letters(reason_hash, style);

-- 통계 뷰/함수가 RLS 를 우회해 anon 에게 노출되지 않도록 실행 권한 회수
REVOKE ALL ON company_stats FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION get_company_stats() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION get_company_rank(TEXT, INTEGER) FROM anon, authenticated, public;
