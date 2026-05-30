import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { quotes, events, clients, organisations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePdf } from "@/lib/quote-pdf";
import React from "react";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();

  const [row] = await db
    .select({ quote: quotes, event: events, client: clients, org: organisations })
    .from(quotes)
    .leftJoin(events, eq(quotes.eventId, events.id))
    .leftJoin(clients, eq(events.clientId, clients.id))
    .leftJoin(organisations, eq(quotes.orgId, organisations.id))
    .where(and(eq(quotes.id, params.id), eq(quotes.orgId, user.orgId)))
    .limit(1);

  if (!row || !row.event || !row.org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(QuotePdf, {
    quote: {
      ...row.quote,
      lineItems: (row.quote.lineItems as Array<{ description: string; qty: number; rate: number; amount: number }>) ?? [],
    },
    event: row.event,
    client: row.client,
    org: row.org,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  const buffer = await renderToBuffer(element);

  // Copy into a plain ArrayBuffer so TypeScript accepts it as BodyInit
  const arrayBuffer = new ArrayBuffer(buffer.length);
  new Uint8Array(arrayBuffer).set(buffer);

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${row.quote.number}.pdf"`,
    },
  });
}
