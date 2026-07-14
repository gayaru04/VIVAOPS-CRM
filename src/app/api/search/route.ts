import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { leads, events, clients } from "@/lib/db/schema";
import { eq, and, or, ilike } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await requireUser();
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ leads: [], events: [], clients: [] });
  }

  const pattern = `%${q}%`;

  const [leadRows, eventRows, clientRows] = await Promise.all([
    db.select({ id: leads.id, name: leads.name, email: leads.email })
      .from(leads)
      .where(and(eq(leads.orgId, user.orgId), or(ilike(leads.name, pattern), ilike(leads.email, pattern))))
      .limit(5),
    db.select({ id: events.id, name: events.name })
      .from(events)
      .where(and(eq(events.orgId, user.orgId), ilike(events.name, pattern)))
      .limit(5),
    db.select({ id: clients.id, name: clients.name, email: clients.email })
      .from(clients)
      .where(and(eq(clients.orgId, user.orgId), or(ilike(clients.name, pattern), ilike(clients.email, pattern))))
      .limit(5),
  ]);

  return NextResponse.json({ leads: leadRows, events: eventRows, clients: clientRows });
}
