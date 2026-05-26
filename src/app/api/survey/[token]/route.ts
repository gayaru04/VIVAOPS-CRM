import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { npsResponses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const [response] = await db
    .select()
    .from(npsResponses)
    .where(eq(npsResponses.token, params.token))
    .limit(1);

  if (!response) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (response.respondedAt) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  const { score, comment } = await req.json();
  if (typeof score !== "number" || score < 1 || score > 10) {
    return NextResponse.json({ error: "Invalid score" }, { status: 422 });
  }

  await db
    .update(npsResponses)
    .set({ score, comment: comment ?? null, respondedAt: new Date() })
    .where(eq(npsResponses.token, params.token));

  return NextResponse.json({ ok: true });
}
