# 퇴사연구소

직장인 퇴사확률 테스트(10문항) · AI 사직서 생성기(Gemini) · 회사별 퇴사확률 랭킹. Next.js 14(App Router) + Supabase.

## 개발

```bash
npm ci
cp .env.example .env.local   # 값이 비어 있으면 Supabase/Gemini 는 인메모리 Mock 으로 동작
npm run dev
```

## 검사

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # vitest (점수 계산·입력 검증·KST 날짜·통계)
npm run build
```

## 데이터베이스

- 처음 만들 때: `supabase-schema.sql`
- 보안 강화: `SUPABASE_SERVICE_ROLE_KEY` 를 배포 환경에 넣은 **뒤에** `supabase/migrations/20261027000000_harden_rls.sql` 실행

환경변수 설명은 `.env.example`, 2026-10-27 점검 내역은 `작업보고.md` 를 참고하세요.
