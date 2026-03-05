import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface CompanyStats {
  company_name: string;
  participant_count: number;
  avg_score: number;
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('results')
      .select('company_name, score');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // JS에서 집계
    const grouped = new Map<string, number[]>();
    for (const row of data ?? []) {
      if (!row.company_name) continue;
      const name = row.company_name.trim();
      if (!name) continue;
      if (!grouped.has(name)) grouped.set(name, []);
      grouped.get(name)!.push(row.score);
    }

    const stats: CompanyStats[] = [];
    for (const [company_name, scores] of Array.from(grouped.entries())) {
      if (scores.length < 3) continue;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      stats.push({
        company_name,
        participant_count: scores.length,
        avg_score: Math.round(avg * 10) / 10,
      });
    }

    stats.sort((a, b) => b.avg_score - a.avg_score);
    const top50 = stats.slice(0, 50);

    const totalParticipants = (data ?? []).length;
    const totalCompanies = grouped.size;

    return NextResponse.json({
      ranking: top50,
      totalParticipants,
      totalCompanies,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
