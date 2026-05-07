import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Senior } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import JobManager from "./JobManager";
import MatchButton from "./MatchButton";

type MatchSummary = { senior_id: string; score: number; status: string };

type SeniorRow = Senior & {
  bestScore: number;
  seniorStatus: "unmatched" | "pending" | "assigned";
};

const STATUS_PRIORITY: Record<string, number> = { done: 3, assigned: 2, pending: 1 };

function seniorStatusOf(matches: MatchSummary[]): SeniorRow["seniorStatus"] {
  if (!matches.length) return "unmatched";
  const best = matches.reduce((a, b) =>
    (STATUS_PRIORITY[b.status] ?? 0) > (STATUS_PRIORITY[a.status] ?? 0) ? b : a
  );
  if (best.status === "assigned" || best.status === "done") return "assigned";
  return "pending";
}

function StatusBadge({ status }: { status: SeniorRow["seniorStatus"] }) {
  if (status === "assigned")
    return <Badge className="text-base px-3 py-1 bg-green-600 hover:bg-green-600">배정 완료</Badge>;
  if (status === "pending")
    return <Badge className="text-base px-3 py-1 bg-yellow-500 hover:bg-yellow-500 text-white">매칭 대기</Badge>;
  return <Badge variant="outline" className="text-base px-3 py-1 text-muted-foreground">미매칭</Badge>;
}

function ScoreBadge({ score }: { score: number }) {
  if (score === 0) return <span className="text-muted-foreground text-lg">-</span>;
  const cls =
    score === 6
      ? "text-yellow-700 font-extrabold"
      : score >= 4
      ? "text-green-700 font-bold"
      : "text-gray-500 font-semibold";
  return <span className={`text-xl ${cls}`}>{score}점</span>;
}

export default async function AdminPage() {
  const [{ data: rawSeniors }, { data: rawMatches }] = await Promise.all([
    supabase.from("seniors").select("*").order("created_at", { ascending: false }),
    supabase.from("matches").select("senior_id, score, status"),
  ]);

  const seniors = (rawSeniors ?? []) as Senior[];
  const allMatches = (rawMatches ?? []) as MatchSummary[];

  // 시니어별 매칭 그룹화
  const matchMap = new Map<string, MatchSummary[]>();
  for (const s of seniors) matchMap.set(s.id, []);
  for (const m of allMatches) matchMap.get(m.senior_id)?.push(m);

  const rows: SeniorRow[] = seniors.map((s) => {
    const ms = matchMap.get(s.id) ?? [];
    return {
      ...s,
      bestScore: ms.reduce((max, m) => Math.max(max, m.score), 0),
      seniorStatus: seniorStatusOf(ms),
    };
  });

  const unmatchedCount = rows.filter((r) => r.seniorStatus === "unmatched").length;
  const pendingCount   = rows.filter((r) => r.seniorStatus === "pending").length;
  const assignedCount  = rows.filter((r) => r.seniorStatus === "assigned").length;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">담당자 대시보드</h1>
      <p className="text-xl text-muted-foreground mb-6">
        매칭 상태별 시니어·일자리 현황을 한눈에 확인합니다.
      </p>

      {/* 전체 매칭 실행 버튼 */}
      <div className="mb-8">
        <MatchButton />
      </div>

      {/* 집계 카드 3개 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700">미매칭 시니어</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-extrabold text-red-800">{unmatchedCount}</p>
            <p className="text-base text-red-600 mt-1">매칭 일자리 없음</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-yellow-700">매칭 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-extrabold text-yellow-800">{pendingCount}</p>
            <p className="text-base text-yellow-600 mt-1">담당자 검토 필요</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-700">배정 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-extrabold text-green-800">{assignedCount}</p>
            <p className="text-base text-green-600 mt-1">배정 또는 완료</p>
          </CardContent>
        </Card>
      </div>

      {/* 시니어 목록 테이블 */}
      <h2 className="text-2xl font-bold mb-4">
        시니어 목록
        <span className="ml-2 text-lg font-normal text-muted-foreground">({seniors.length}명)</span>
      </h2>

      {seniors.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-xl text-muted-foreground">
          등록된 시니어가 없습니다.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden mb-10">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-lg font-bold">이름</TableHead>
                <TableHead className="text-lg font-bold">지역</TableHead>
                <TableHead className="text-lg font-bold">희망 직종</TableHead>
                <TableHead className="text-lg font-bold text-center">최고 점수</TableHead>
                <TableHead className="text-lg font-bold text-center">상태</TableHead>
                <TableHead className="text-lg font-bold text-center">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-lg font-semibold">{row.name}</TableCell>
                  <TableCell className="text-lg">{row.region}</TableCell>
                  <TableCell className="text-lg">{row.desired_job}</TableCell>
                  <TableCell className="text-center">
                    <ScoreBadge score={row.bestScore} />
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={row.seniorStatus} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      href={`/recommendations?senior_id=${row.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-base font-medium hover:bg-muted transition-colors"
                    >
                      상세 보기
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <JobManager />
    </div>
  );
}
