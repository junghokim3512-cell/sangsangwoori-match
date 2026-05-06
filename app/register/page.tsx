"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const REGIONS = ["서울", "경기", "인천"];
const JOBS = ["경비", "청소", "주차관리", "택배분류"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    region: "",
    desired_job: "",
    career_years: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.region || !form.desired_job || form.career_years === "") {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    setLoading(true);
    const { error: dbError } = await supabase.from("seniors").insert({
      name: form.name.trim(),
      region: form.region,
      desired_job: form.desired_job,
      career_years: Number(form.career_years),
    });

    if (dbError) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setLoading(false);
      return;
    }

    router.push("/recommendations");
  }

  const inputClass =
    "border border-input rounded-lg px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background w-full";

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">프로필 등록</h1>
      <p className="text-xl text-muted-foreground mb-10">
        아래 항목을 작성하면 맞는 일자리를 자동으로 찾아드립니다.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 이름 */}
        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold" htmlFor="name">
            이름
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* 지역 */}
        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold" htmlFor="region">
            지역
          </label>
          <select
            id="region"
            name="region"
            value={form.region}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">선택해 주세요</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 희망 직종 */}
        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold" htmlFor="desired_job">
            희망 직종
          </label>
          <select
            id="desired_job"
            name="desired_job"
            value={form.desired_job}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">선택해 주세요</option>
            {JOBS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* 경력 */}
        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold" htmlFor="career_years">
            경력 (년)
          </label>
          <input
            id="career_years"
            name="career_years"
            type="number"
            min={0}
            max={50}
            placeholder="0"
            value={form.career_years}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-destructive text-lg font-medium">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="mt-2 py-6 text-2xl font-bold"
        >
          {loading ? "저장 중..." : "등록하기"}
        </Button>
      </form>
    </div>
  );
}
