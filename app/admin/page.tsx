import { supabase } from "@/lib/supabase";

type MatchRow = {
  id: string;
  score: number;
  status: string;
  seniors: { name: string; region: string; desired_job: string; career_years: number };
  jobs: { title: string; region: string; job_type: string };
};

const COLUMNS = [
  { status: "pending",  label: "미매칭",   color: "bg-red-100 border-red-300 text-red-800",       empty: "미매칭 항목이 없습니다" },
  { status: "waiting",  label: "매칭 대기", color: "bg-yellow-100 border-yellow-300 text-yellow-800", empty: "대기 중인 항목이 없습니다" },
  { status: "assigned", label: "배정 완료", color: "bg-green-100 border-green-300 text-green-800",  empty: "배정 완료 항목이 없습니다" },
] as const;

async function fetchMatches(): Promise<MatchRow[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, score, status, seniors(name, region, desired_job, career_years), jobs(title, region, job_type)")
    .order("score", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as MatchRow[];
}

export default async function AdminPage() {
  const matches = await fetchMatches();

  const grouped = Object.fromEntries(
    COLUMNS.map((col) => [col.status, matches.filter((m) => m.status === col.status)])
  );

  const total = matches.length;

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <h1 className="text-4xl font-bold">담당자 대시보드</h1>
        <span className="text-lg text-muted-foreground mb-1">전체 {total}건</span>
      </div>
      <p className="text-xl text-muted-foreground mb-8">
        매칭 상태별 시니어·일자리 현황을 한눈에 확인합니다.
      </p>

      {/* 요약 뱃지 */}
      <div className="flex flex-wrap gap-3 mb-8">
        {COLUMNS.map((col) => (
          <span
            key={col.status}
            className={`border rounded-full px-4 py-1 text-base font-semibold ${col.color}`}
          >
            {col.label} {grouped[col.status].length}건
          </span>
        ))}
      </div>

      {/* 3열 칸반 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const cards = grouped[col.status];
          return (
            <section key={col.status} className="flex flex-col gap-3">
              {/* 컬럼 헤더 */}
              <h2 className={`text-xl font-bold rounded-lg border px-4 py-2 ${col.color}`}>
                {col.label}
                <span className="ml-2 text-base font-normal">({cards.length})</span>
              </h2>

              {/* 빈 상태 */}
              {cards.length === 0 && (
                <div className="border border-dashed border-border rounded-xl p-6 text-center text-muted-foreground text-base">
                  {col.empty}
                </div>
              )}

              {/* 매칭 카드 목록 */}
              {cards.map((m) => (
                <div key={m.id} className="border border-border rounded-xl p-4 flex flex-col gap-2">
                  {/* 시니어 */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{m.seniors.name}</span>
                    <span className="text-sm text-muted-foreground">{m.seniors.region}</span>
                  </div>
                  <p className="text-base text-muted-foreground">
                    {m.seniors.desired_job} · 경력 {m.seniors.career_years}년
                  </p>

                  {/* 구분선 */}
                  <div className="border-t border-border my-1" />

                  {/* 일자리 */}
                  <p className="text-base font-semibold">{m.jobs.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.jobs.region} · {m.jobs.job_type}
                  </p>

                  {/* 점수 */}
                  <div className="flex justify-end">
                    <span className="text-2xl font-extrabold text-primary">
                      {m.score}<span className="text-sm font-normal text-muted-foreground ml-1">점</span>
                    </span>
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
