import { NextRequest, NextResponse } from "next/server";
import { runMatchingForSenior, runMatchingForAll } from "@/lib/matching";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { senior_id } = body as { senior_id?: string };

  const result = senior_id
    ? await runMatchingForSenior(senior_id)
    : await runMatchingForAll();

  return NextResponse.json(result);
}
