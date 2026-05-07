import Link from "next/link";
import { supabase } from "@/lib/supabase";

type MatchWithJob = {
  id: string;
  score: number;
  status: string;
  jobs: {
    title: string;
    region: string;
    job_type: string;
    required_career: number;
  };
};

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score === 6
      ? "bg-yellow-100 text-yellow-800 border-yellow-400"
      : score >= 4
      ? "bg-green-100 text-green-800 border-green-400"
      : "bg-gray-100 text-gray-600 border-gray-300";
  return (
    <span className={`border rounded-full px-4 py-1 text-xl font-bold ${cls}`}>
      {score === 6 ? "★ " : ""}{score}점
    </span>
  );
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior_id?: string }>;
}) {
  const { senior_id } = await searchParams;

  // senior_id 없으면 시니어 선택 안내
  if (!senior_id) {
    const { data: seniors } = await supabase
      .from("seniors")
      .select("id, name, region")
      .order("created_at", { ascending: false });

    return (
      <div>
        <h1 className="text-4xl font-bold mb-2">추천 목록</h1>
        <p className="text-xl text-muted-foreground mb-8">
          추천을 확인할 시니어를 선택하세요.
        </p>
        {!seniors?.length ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center text-xl text-muted-foreground">
            등록된 시니어가 없습니다.{" "}
            <Link href="/register" className="underline font-semibold">
              프로필 등록
            </Link>
            에서 시작하세요.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {seniors.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/recommendations?senior_id=${s.id}`}
                  className="flex items-center justify-between border border-border rounded-xl px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-2xl font-bold">{s.name}</span>
                  <span className="text-lg text-muted-foreground">{s.region}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // 시니어 정보 + 매칭 결과 조회
  const [{ data: senior }, { data: rawMatches }] = await Promise.all([
    supabase.from("seniors").select("name, region, desired_job, career_years").eq("id", senior_id).single(),
    supabase
      .from("matches")
      .select("id, score, status, jobs(title, region, job_type, required_career)")
      .eq("senior_id", senior_id)
      .gt("score", 0)
      .order("score", { ascending: false }),
  ]);

  const matches = (rawMatches ?? []) as unknown as MatchWithJob[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-1">
          {senior?.name ?? "시니어"}님의 추천 일자리
        </h1>
        <p className="text-xl text-muted-foreground">
          {senior?.region} · {senior?.desired_job} · 경력 {senior?.career_years}년
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-14 flex flex-col items-center gap-4 text-center">
          <p className="text-2xl font-semibold text-muted-foreground">
            현재 매칭되는 일자리가 없습니다.
          </p>
          <p className="text-lg text-muted-foreground">
            담당자가 일자리를 등록하면 자동으로 매칭됩니다.
          </p>
          <Link href="/admin" className="text-lg underline font-semibold mt-2">
            관리자 페이지에서 일자리 등록
          </Link>
        </div>
      ) : (
        <>
          <p className="text-lg text-muted-foreground mb-6">
            총 {matches.length}개 매칭 · 점수 내림차순
          </p>
          <ul className="flex flex-col gap-4">
            {matches.map((m) => (
              <li
                key={m.id}
                className="border border-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-2xl font-bold">{m.jobs.title}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-lg text-muted-foreground">
                    <span>📍 {m.jobs.region}</span>
                    <span>🔧 {m.jobs.job_type}</span>
                    <span>📋 필요 경력 {m.jobs.required_career}년 이상</span>
                  </div>
                </div>
                <ScoreBadge score={m.score} />
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-10">
        <Link href="/recommendations" className="text-lg text-muted-foreground underline">
          ← 시니어 목록으로
        </Link>
      </div>
    </div>
  );
}
