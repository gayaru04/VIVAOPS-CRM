export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, clients, runSheetItems, eventStaff, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { RunSheetPdf } from "@/lib/run-sheet-pdf";
import React from "react";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();

  const [row] = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(and(eq(events.id, params.id), eq(events.orgId, user.orgId)))
    .limit(1);

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [items, staffRows] = await Promise.all([
    db.select().from(runSheetItems).where(eq(runSheetItems.eventId, row.event.id)).orderBy(runSheetItems.time),
    db.select({ staff: eventStaff, member: users })
      .from(eventStaff)
      .leftJoin(users, eq(eventStaff.userId, users.id))
      .where(eq(eventStaff.eventId, row.event.id)),
  ]);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(RunSheetPdf, { event: row.event, client: row.client, items, staffRows }) as any;
    const buffer = await renderToBuffer(element);
    const arrayBuffer = new ArrayBuffer(buffer.length);
    new Uint8Array(arrayBuffer).set(buffer);

    const safeName = row.event.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="run-sheet-${safeName}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[RunSheet PDF]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
