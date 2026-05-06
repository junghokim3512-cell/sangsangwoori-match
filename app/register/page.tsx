export default function RegisterPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">프로필 등록</h1>
      <p className="text-xl text-muted-foreground mb-10">
        아래 항목을 작성하면 맞는 일자리를 자동으로 찾아드립니다.
      </p>

      {/* 폼 뼈대 — 기능 구현은 다음 블록 */}
      <form className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold" htmlFor="name">
            이름
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            className="border border-input rounded-lg px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-ring"
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold" htmlFor="region">
            지역
          </label>
          <input
            id="region"
            name="region"
            type="text"
            placeholder="서울 강남구"
            className="border border-input rounded-lg px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-ring"
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold" htmlFor="desired_job">
            희망 직종
          </label>
          <input
            id="desired_job"
            name="desired_job"
            type="text"
            placeholder="경비, 청소, 요양 등"
            className="border border-input rounded-lg px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-ring"
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold" htmlFor="career_years">
            경력 (년)
          </label>
          <input
            id="career_years"
            name="career_years"
            type="number"
            min={0}
            placeholder="5"
            className="border border-input rounded-lg px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-ring"
            disabled
          />
        </div>

        <button
          type="submit"
          disabled
          className="mt-4 bg-primary text-primary-foreground rounded-lg py-4 text-2xl font-bold opacity-50 cursor-not-allowed"
        >
          등록하기
        </button>
      </form>

      <p className="mt-6 text-base text-muted-foreground text-center">
        * 기능 구현 예정
      </p>
    </div>
  );
}
