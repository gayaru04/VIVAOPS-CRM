"use server";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createQuoteSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function generateQuoteNumber(): string {
  return `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
}

export async function createQuote(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const raw = {
    ...Object.fromEntries(formData),
    lineItems: JSON.parse((formData.get("lineItems") as string) || "[]"),
  };
  const data = createQuoteSchema.parse(raw);

  const [quote] = await db.insert(quotes).values({
    orgId: user.orgId,
    eventId: data.eventId,
    number: generateQuoteNumber(),
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    validUntil: data.validUntil || null,
    notes: data.notes || null,
    lineItems: data.lineItems,
    createdBy: user.id,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "quote.created",
    entityType: "quote",
    entityId: quote.id,
    summary: `Created quote ${quote.number}: $${quote.total}`,
  });

  revalidatePath(`/events/${data.eventId}`);
}

export async function updateQuoteStatus(
  id: string,
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
) {
  const user = await requireRole("admin", "manager", "coordinator");
  const [quote] = await db.update(quotes).set({ status, updatedAt: new Date() }).where(eq(quotes.id, id)).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "quote.status_changed",
    entityType: "quote",
    entityId: id,
    summary: `Quote status → ${status}`,
  });

  revalidatePath(`/events/${quote.eventId}`);
}
