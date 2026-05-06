import { supabase } from "@/lib/supabase";

type MatchRow = {
  id: string;
  score: number;
  status: string;
  seniors: {
    name: string;
    region: string;
    desired_job: string;
    career_years: number;
  };
  jobs: {
    title: string;
    region: string;
    job_type: string;
    required_career: number;
  };
};

async function fetchMatches(): Promise<MatchRow[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, score, status, seniors(name, region, desired_job, career_years), jobs(title, region, job_type, required_career)")
    .order("score", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as MatchRow[];
}

const STATUS_LABEL: Record<string, string> = {
  pending:  "미매칭",
  waiting:  "매칭 대기",
  assigned: "배정 완료",
};

const STATUS_COLOR: Record<string, string> = {
  pending:  "bg-red-100 text-red-700 border-red-300",
  waiting:  "bg-yellow-100 text-yellow-700 border-yellow-300",
  assigned: "bg-green-100 text-green-700 border-green-300",
};

export default async function RecommendationsPage() {
  const matches = await fetchMatches();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">자동 매칭 추천 목록</h1>
      <p className="text-xl text-muted-foreground mb-8">
        매칭 점수 높은 순으로 일자리를 보여줍니다.
      </p>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center border border-dashed border-border rounded-xl">
          <p className="text-2xl font-semibold text-muted-foreground">
            아직 매칭된 일자리가 없습니다.
          </p>
          <p className="text-lg text-muted-foreground">
            프로필을 등록하면 자동으로 매칭이 진행됩니다.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {matches.map((m) => (
            <li
              key={m.id}
              className="border border-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* 왼쪽: 시니어 & 일자리 정보 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl font-bold">{m.jobs.title}</span>
                  <span
                    className={`text-sm font-semibold border rounded-full px-3 py-0.5 ${
                      STATUS_COLOR[m.status] ?? "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {STATUS_LABEL[m.status] ?? m.status}
                  </span>
                </div>

                <div className="text-lg text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  <span>📍 {m.jobs.region}</span>
                  <span>🔧 {m.jobs.job_type}</span>
                  <span>📋 필요 경력 {m.jobs.required_career}년 이상</span>
                </div>

                <div className="text-base text-muted-foreground border-t border-border pt-2 mt-1 flex flex-wrap gap-x-4">
                  <span>신청자: <strong>{m.seniors.name}</strong></span>
                  <span>거주지: {m.seniors.region}</span>
                  <span>경력: {m.seniors.career_years}년</span>
                </div>
              </div>

              {/* 오른쪽: 점수 */}
              <div className="flex flex-col items-center justify-center min-w-[80px]">
                <span className="text-4xl font-extrabold text-primary">
                  {m.score}
                </span>
                <span className="text-base text-muted-foreground font-medium">점</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
