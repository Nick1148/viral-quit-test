import { fetchAllRows, getSupabase } from './supabase';
import { isUuid } from './validation';

// 회사 통계는 이 인원 이상일 때만 보여준다 (소수 인원일 때 개인 점수가 그대로 드러나는 것을 막는다)
export const MIN_COMPANY_PARTICIPANTS = 3;
export const RANKING_LIMIT = 50;

export interface PublicResult {
  id: string;
  company_name: string;
  score: number;
  title_type: string;
  created_at: string;
}

export interface CompanyStats {
  companyAvg: number | null;
  participantCount: number;
  // 회사 내 상위 몇 % 인지 (높을수록 퇴사확률이 높은 쪽). 인원이 적으면 null.
  rankPercent: number | null;
}

export interface RankingRow {
  company_name: string;
  participant_count: number;
  avg_score: number;
}

export interface RankingData {
  ranking: RankingRow[];
  totalParticipants: number;
  totalCompanies: number;
}

export function computeCompanyStats(scores: number[], myScore: number): CompanyStats {
  const participantCount = scores.length;
  if (participantCount < MIN_COMPANY_PARTICIPANTS) {
    return { companyAvg: null, participantCount, rankPercent: null };
  }
  const total = scores.reduce((sum, s) => sum + s, 0);
  const higher = scores.filter((s) => s > myScore).length;
  return {
    companyAvg: Math.round(total / participantCount),
    participantCount,
    rankPercent: Math.max(1, Math.round(((higher + 1) / participantCount) * 100)),
  };
}

export function computeRanking(rows: { company_name: string | null; score: number }[]): RankingData {
  const grouped = new Map<string, number[]>();
  let totalParticipants = 0;
  for (const row of rows) {
    const name = row.company_name?.trim();
    if (!name || typeof row.score !== 'number') continue;
    totalParticipants++;
    const list = grouped.get(name);
    if (list) list.push(row.score);
    else grouped.set(name, [row.score]);
  }

  const ranking: RankingRow[] = [];
  grouped.forEach((scores, company_name) => {
    if (scores.length < MIN_COMPANY_PARTICIPANTS) return;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    ranking.push({
      company_name,
      participant_count: scores.length,
      avg_score: Math.round(avg * 10) / 10,
    });
  });

  // 평균이 같으면 참여자가 많은 회사, 그다음 이름 순으로 고정 정렬
  ranking.sort(
    (a, b) =>
      b.avg_score - a.avg_score ||
      b.participant_count - a.participant_count ||
      a.company_name.localeCompare(b.company_name, 'ko'),
  );

  return {
    ranking: ranking.slice(0, RANKING_LIMIT),
    totalParticipants,
    totalCompanies: grouped.size,
  };
}

export async function getResultWithStats(id: string): Promise<{ result: PublicResult; stats: CompanyStats } | null> {
  if (!isUuid(id)) return null;

  const { data: result, error } = await getSupabase()
    .from('results')
    .select('id, company_name, score, title_type, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error || !result) return null;

  const { data: companyRows, error: statsError } = await fetchAllRows<{ score: number }>(() =>
    getSupabase().from('results').select('score').eq('company_name', result.company_name),
  );

  const stats = statsError
    ? { companyAvg: null, participantCount: 0, rankPercent: null }
    : computeCompanyStats(companyRows.map((r) => r.score), result.score);

  return { result: result as PublicResult, stats };
}

export async function getRanking(): Promise<RankingData> {
  const { data, error } = await fetchAllRows<{ company_name: string | null; score: number }>(() =>
    getSupabase().from('results').select('company_name, score').order('id', { ascending: true }),
  );
  if (error) throw new Error(error.message);
  return computeRanking(data);
}
