import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, organisations } from "@/lib/db/schema";
import { createLeadSchema } from "@/lib/validators";
import { z } from "zod";

const inquirySchema = createLeadSchema.extend({
  orgSlug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = inquirySchema.parse(body);

    // Use the first org (single-tenant for now)
    const [org] = await db.select().from(organisations).limit(1);
    if (!org) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const [lead] = await db.insert(leads).values({
      orgId: org.id,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      source: "website",
      eventType: data.eventType || null,
      eventDate: data.eventDate || null,
      estimatedBudget: data.estimatedBudget || null,
      guestCount: data.guestCount ? Number(data.guestCount) : null,
      notes: data.notes || null,
    }).returning({ id: leads.id });

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 422 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
