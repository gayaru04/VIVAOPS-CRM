import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/session";
import { generateICS } from "@/lib/ical";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, params.id), eq(events.orgId, user.orgId)))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ics = generateICS({
    id: event.id,
    name: event.name,
    date: event.eventDate,
    venue: event.venue,
    description: event.notes,
  });

  if (!ics) return NextResponse.json({ error: "Event has no date set" }, { status: 400 });

  const filename = event.name.replace(/[^a-z0-9]/gi, "_") + ".ics";

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
