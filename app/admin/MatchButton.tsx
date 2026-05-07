"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MatchButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleMatch() {
    setLoading(true);
    setResult("");
    const res = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const json = await res.json();
    setResult(`매칭 완료 (${json.method ?? "ok"})`);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Button
        size="lg"
        onClick={handleMatch}
        disabled={loading}
        className="text-xl py-6 px-8"
      >
        {loading ? "매칭 실행 중..." : "전체 매칭 실행"}
      </Button>
      {result && (
        <span className="text-lg font-semibold text-green-700">{result}</span>
      )}
    </div>
  );
}
