export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SeniorInfo = {
  id: string;
  name: string;
  region: string;
  desired_job: string;
  career_years: number;
};

type MatchRow = {
  job_id: string;
  score: number;
  seniors: SeniorInfo;
};

type JobRow = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  required_career: number;
};

function ScoreBadge({ score }: { score: number }) {
  if (score === 6)
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white text-base px-3 py-1 shrink-0">
        ★ {score}점
      </Badge>
    );
  if (score >= 4)
    return (
      <Badge className="bg-green-600 hover:bg-green-600 text-white text-base px-3 py-1 shrink-0">
        {score}점
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-base px-3 py-1 shrink-0">
      {score}점
    </Badge>
  );
}

export default async function JobsPage() {
  const [{ data: rawJobs }, { data: rawMatches }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, region, job_type, required_career")
      .order("region")
      .order("title"),
    supabase
      .from("matches")
      .select("job_id, score, seniors(id, name, region, desired_job, career_years)")
      .gt("score", 0)
      .order("score", { ascending: false }),
  ]);

  const jobs = (rawJobs ?? []) as JobRow[];
  const matches = (rawMatches ?? []) as unknown as MatchRow[];

  const matchesByJob = new Map<string, { score: number; senior: SeniorInfo }[]>();
  for (const job of jobs) matchesByJob.set(job.id, []);
  for (const m of matches) {
    matchesByJob.get(m.job_id)?.push({ score: m.score, senior: m.seniors });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-1">일자리별 추천 시니어</h1>
          <p className="text-xl text-muted-foreground">
            각 일자리에 가장 잘 맞는 시니어를 점수 순으로 확인합니다.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-lg text-muted-foreground underline shrink-0"
        >
          ← 대시보드
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-xl text-muted-foreground">
          등록된 일자리가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => {
            const candidates = matchesByJob.get(job.id) ?? [];
            return (
              <Card key={job.id} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <p className="text-base text-muted-foreground">
                    📍 {job.region} · 🔧 {job.job_type} · 경력 {job.required_career}년 이상
                  </p>
                </CardHeader>
                <CardContent>
                  {candidates.length === 0 ? (
                    <p className="text-base text-muted-foreground py-2">
                      매칭되는 시니어 없음
                    </p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-border">
                      {candidates.map(({ score, senior }, i) => (
                        <li
                          key={`${senior.id}-${i}`}
                          className="flex items-center justify-between py-3 gap-3"
                        >
                          <div className="min-w-0">
                            <span className="text-xl font-bold">{senior.name}</span>
                            <span className="text-base text-muted-foreground ml-2">
                              {senior.region} · {senior.desired_job} · {senior.career_years}년
                            </span>
                          </div>
                          <ScoreBadge score={score} />
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
