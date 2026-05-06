"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const REGIONS = ["서울", "경기", "인천"];
const JOB_TYPES = ["경비", "청소", "주차관리", "택배분류"];

const EMPTY_FORM = { title: "", region: "", job_type: "", required_career: "" };

export default function JobManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadJobs() {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    setJobs((data ?? []) as Job[]);
  }

  useEffect(() => { loadJobs(); }, []);

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.region || !form.job_type || form.required_career === "") {
      setError("모든 항목을 입력해 주세요.");
      return;
    }
    setLoading(true);
    const { error: dbErr } = await supabase.from("jobs").insert({
      title: form.title.trim(),
      region: form.region,
      job_type: form.job_type,
      required_career: Number(form.required_career),
    });
    setLoading(false);
    if (dbErr) { setError("저장 중 오류가 발생했습니다."); return; }
    setForm(EMPTY_FORM);
    await loadJobs();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 일자리를 삭제하시겠습니까?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    await loadJobs();
  }

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-1">일자리 관리</h2>
      <p className="text-lg text-muted-foreground mb-8">
        일자리를 등록하고 목록을 관리합니다.
      </p>

      {/* 일자리 추가 폼 */}
      <form
        onSubmit={handleAdd}
        className="border border-border rounded-xl p-6 flex flex-col gap-5 mb-10 bg-muted/30"
      >
        <h3 className="text-2xl font-semibold">새 일자리 추가</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 공고명 */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold" htmlFor="job-title">
              공고명
            </label>
            <Input
              id="job-title"
              placeholder="예: 강남구 아파트 경비원"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className="text-lg py-5"
            />
          </div>

          {/* 요구 경력 */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold" htmlFor="job-career">
              요구 경력 (년)
            </label>
            <Input
              id="job-career"
              type="number"
              min={0}
              max={50}
              placeholder="0"
              value={form.required_career}
              onChange={(e) => setField("required_career", e.target.value)}
              className="text-lg py-5"
            />
          </div>

          {/* 지역 */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">지역</label>
            <Select value={form.region} onValueChange={(v) => setField("region", v ?? "")}>
              <SelectTrigger className="text-lg py-5 h-auto">
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r} className="text-lg">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 직종 */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">직종</label>
            <Select value={form.job_type} onValueChange={(v) => setField("job_type", v ?? "")}>
              <SelectTrigger className="text-lg py-5 h-auto">
                <SelectValue placeholder="직종 선택" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((j) => (
                  <SelectItem key={j} value={j} className="text-lg">
                    {j}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-destructive text-lg font-medium">{error}</p>}

        <Button type="submit" size="lg" disabled={loading} className="text-xl py-6 w-full sm:w-auto self-start">
          {loading ? "저장 중..." : "일자리 추가"}
        </Button>
      </form>

      {/* 등록된 일자리 목록 */}
      <h3 className="text-2xl font-semibold mb-4">
        등록된 일자리
        <span className="ml-2 text-lg font-normal text-muted-foreground">({jobs.length}건)</span>
      </h3>

      {jobs.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground text-lg">
          등록된 일자리가 없습니다.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-lg font-bold">공고명</TableHead>
                <TableHead className="text-lg font-bold">지역</TableHead>
                <TableHead className="text-lg font-bold">직종</TableHead>
                <TableHead className="text-lg font-bold text-center">요구 경력</TableHead>
                <TableHead className="text-lg font-bold text-center">삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="text-lg font-medium">{job.title}</TableCell>
                  <TableCell className="text-lg">{job.region}</TableCell>
                  <TableCell className="text-lg">{job.job_type}</TableCell>
                  <TableCell className="text-lg text-center">{job.required_career}년</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-base px-4 py-2"
                      onClick={() => handleDelete(job.id)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
