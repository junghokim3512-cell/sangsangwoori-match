"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const REGIONS = ["서울", "경기", "인천"];
const JOBS = ["경비", "청소", "주차관리", "택배분류"];

const inputClass =
  "border-2 border-input rounded-xl px-5 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background w-full text-foreground";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xl font-bold text-foreground">{label}</span>
      <span className="text-base text-muted-foreground mb-1">{hint}</span>
      {children}
    </div>
  );
}

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
  const [success, setSuccess] = useState(false);

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
    const { data: inserted, error: dbError } = await supabase
      .from("seniors")
      .insert({
        name: form.name.trim(),
        region: form.region,
        desired_job: form.desired_job,
        career_years: Number(form.career_years),
      })
      .select("id")
      .single();

    if (dbError || !inserted) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setLoading(false);
      return;
    }

    // DB 트리거(정규화 없음)를 JS 정규화 매칭으로 덮어씀 — 완료 후 이동
    await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senior_id: inserted.id }),
    });

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      router.push(`/recommendations?senior_id=${inserted.id}`);
    }, 1500);
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-foreground">
        시니어 일자리 신청하기
      </h1>
      <p className="text-xl text-muted-foreground mb-10">
        아래 항목을 작성하면 맞는 일자리를 자동으로 찾아드립니다.
      </p>

      {success && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-8">
          <p className="text-green-800 text-2xl font-bold">
            등록이 완료되었습니다.
          </p>
          <p className="text-green-700 text-lg mt-2">
            담당자가 곧 연락드립니다. 잠시 후 추천 목록으로 이동합니다...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <Field label="이름" hint="성함을 적어 주세요">
          <input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="지역" hint="어디에서 일하고 싶으세요?">
          <select
            id="region"
            name="region"
            value={form.region}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">선택해 주세요</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>

        <Field label="희망 직종" hint="어떤 일을 하시겠어요?">
          <select
            id="desired_job"
            name="desired_job"
            value={form.desired_job}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">선택해 주세요</option>
            {JOBS.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </Field>

        <Field label="경력 (년)" hint="일하신 기간이 얼마나 되세요?">
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
        </Field>

        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl px-5 py-4">
            <p className="text-red-800 text-lg font-semibold">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading || success}
          className="mt-2 h-14 text-2xl font-bold"
        >
          {loading ? "저장 중..." : "등록하기"}
        </Button>
      </form>
    </div>
  );
}
