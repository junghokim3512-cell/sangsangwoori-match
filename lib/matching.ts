import { supabase } from "./supabase";
import type { Senior, Job } from "./supabase";

// 지역(+3) · 직종(+2) · 경력(+1) = 최대 6점
export function calcScore(
  senior: Pick<Senior, "region" | "desired_job" | "career_years">,
  job: Pick<Job, "region" | "job_type" | "required_career">
): number {
  let score = 0;
  if (senior.region === job.region) score += 3;
  if (senior.desired_job === job.job_type) score += 2;
  if (senior.career_years >= job.required_career) score += 1;
  return score;
}

export async function runMatchingForSenior(seniorId: string): Promise<{ method: string }> {
  const { error } = await supabase.rpc("rematch_senior", { p_senior_id: seniorId });
  if (!error) return { method: "rpc" };

  // 폴백: 앱 레이어에서 재계산
  const [{ data: senior }, { data: jobs }] = await Promise.all([
    supabase.from("seniors").select("*").eq("id", seniorId).single(),
    supabase.from("jobs").select("*"),
  ]);
  if (!senior || !jobs?.length) return { method: "fallback-noop" };

  await supabase.from("matches").delete().eq("senior_id", seniorId);
  const rows = (jobs as Job[])
    .map((job) => ({ senior_id: seniorId, job_id: job.id, score: calcScore(senior as Senior, job), status: "pending" }))
    .filter((r) => r.score > 0);
  if (rows.length) await supabase.from("matches").insert(rows);
  return { method: "fallback" };
}

export async function runMatchingForAll(): Promise<{ method: string }> {
  const { error } = await supabase.rpc("rematch_all");
  if (!error) return { method: "rpc" };

  // 폴백: 앱 레이어에서 재계산
  const [{ data: seniors }, { data: jobs }] = await Promise.all([
    supabase.from("seniors").select("*"),
    supabase.from("jobs").select("*"),
  ]);
  if (!seniors?.length || !jobs?.length) return { method: "fallback-noop" };

  for (const senior of seniors as Senior[]) {
    await supabase.from("matches").delete().eq("senior_id", senior.id);
    const rows = (jobs as Job[])
      .map((job) => ({ senior_id: senior.id, job_id: job.id, score: calcScore(senior, job), status: "pending" }))
      .filter((r) => r.score > 0);
    if (rows.length) await supabase.from("matches").insert(rows);
  }
  return { method: "fallback" };
}
