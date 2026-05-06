export default function RecommendationsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">자동 매칭 추천 목록</h1>
      <p className="text-xl text-muted-foreground mb-10">
        매칭 점수 높은 순으로 일자리를 보여줍니다.
      </p>

      {/* 정렬 안내 뱃지 — 기능 구현 예정 */}
      <div className="flex items-center gap-3 mb-6">
        <span className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-base font-semibold">
          점수 내림차순
        </span>
        <span className="text-muted-foreground text-base">* 기능 구현 예정</span>
      </div>

      {/* 카드 뼈대 */}
      <ul className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <li
            key={i}
            className="border border-border rounded-xl p-6 flex items-center justify-between opacity-40"
          >
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-muted-foreground">
                일자리 #{i}
              </span>
              <span className="text-lg text-muted-foreground">
                지역 · 직종 · 필요 경력
              </span>
            </div>
            <span className="text-3xl font-extrabold text-muted-foreground">
              {100 - i * 10}점
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
