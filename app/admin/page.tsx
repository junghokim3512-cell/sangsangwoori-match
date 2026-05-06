const COLUMNS = [
  { key: "unmatched", label: "미매칭", color: "bg-red-100 border-red-300 text-red-800" },
  { key: "waiting",   label: "매칭 대기", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
  { key: "assigned",  label: "배정 완료", color: "bg-green-100 border-green-300 text-green-800" },
] as const;

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">담당자 대시보드</h1>
      <p className="text-xl text-muted-foreground mb-10">
        매칭 상태별 시니어·일자리 현황을 한눈에 확인합니다.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <section key={col.key} className="flex flex-col gap-4">
            <h2
              className={`text-2xl font-bold rounded-lg border px-4 py-3 ${col.color}`}
            >
              {col.label}
            </h2>

            {/* 카드 뼈대 3개 */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-border rounded-xl p-5 opacity-40"
              >
                <p className="text-xl font-semibold text-muted-foreground">
                  시니어 이름 #{i}
                </p>
                <p className="text-base text-muted-foreground mt-1">
                  희망 직종 · 지역
                </p>
              </div>
            ))}

            <p className="text-sm text-muted-foreground text-center">
              * 기능 구현 예정
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
