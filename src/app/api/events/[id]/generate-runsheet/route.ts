import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/session";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, params.id), eq(events.orgId, user.orgId)))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const prompt = `Generate a professional run sheet for this event:
- Event name: ${event.name}
- Event type: ${event.type ?? "corporate event"}
- Date: ${event.eventDate ?? "TBD"}
- Venue: ${event.venue ?? "TBD"}
- Guest count: ${event.guestCount ?? "unknown"}
- Notes: ${event.notes ?? "none"}

Return ONLY a JSON array of run sheet items. Each item must have:
- "time": 24-hour format string like "17:30"
- "title": short action title (max 8 words)
- "description": optional extra detail (1 sentence, or null)

Generate 8-14 realistic items covering setup, arrival, program flow, and pack-down.
Return only the JSON array, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return NextResponse.json({ error: "AI returned invalid response" }, { status: 500 });

    const items = JSON.parse(jsonMatch[0]) as Array<{ time: string; title: string; description: string | null }>;
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
