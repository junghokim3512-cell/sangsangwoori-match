import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-20 text-center">
      <h1 className="text-5xl font-bold leading-tight">
        시니어 일자리
        <br />
        자동 매칭 시스템
      </h1>
      <p className="text-2xl text-muted-foreground max-w-xl">
        프로필을 등록하면 나에게 맞는 일자리를 자동으로 찾아드립니다.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="text-xl py-6 px-10">
          <Link href="/register">프로필 등록하기</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="text-xl py-6 px-10">
          <Link href="/recommendations">추천 목록 보기</Link>
        </Button>
      </div>
    </div>
  );
}
