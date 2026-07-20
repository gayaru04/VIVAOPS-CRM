"use server";
import { db } from "@/lib/db";
import { leads, clients, events, comms } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createLeadSchema, updateLeadSchema } from "@/lib/validators";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createLead(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const raw = Object.fromEntries(formData);
  const data = createLeadSchema.parse(raw);

  const [lead] = await db.insert(leads).values({
    orgId: user.orgId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company: data.company || null,
    source: data.source,
    eventType: data.eventType || null,
    eventDate: data.eventDate || null,
    estimatedBudget: data.estimatedBudget || null,
    guestCount: data.guestCount ? Number(data.guestCount) : null,
    notes: data.notes || null,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "lead.created",
    entityType: "lead",
    entityId: lead.id,
    summary: `Created lead: ${lead.name}`,
  });

  revalidatePath("/leads");
  redirect(`/leads/${lead.id}`);
}

export async function updateLead(id: string, formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const raw = Object.fromEntries(formData);
  const data = updateLeadSchema.parse(raw);

  await db.update(leads).set({
    ...data,
    eventType: data.eventType || null,
    guestCount: data.guestCount ? Number(data.guestCount) : undefined,
    updatedAt: new Date(),
  }).where(eq(leads.id, id));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "lead.updated",
    entityType: "lead",
    entityId: id,
    summary: `Updated lead`,
  });

  revalidatePath(`/leads/${id}`);
  revalidatePath("/leads");
  redirect(`/leads/${id}`);
}

export async function convertLeadToEvent(leadId: string, formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) throw new Error("Lead not found");

  // Create client from lead
  const clientName = formData.get("clientName") as string || lead.name;
  const [client] = await db.insert(clients).values({
    orgId: user.orgId,
    name: clientName,
    email: lead.email || null,
    phone: lead.phone || null,
    company: lead.company || null,
  }).returning();

  // Create event
  const eventName = formData.get("eventName") as string ||
    `${lead.name}${lead.eventType ? ` – ${lead.eventType}` : ""}`;

  const [event] = await db.insert(events).values({
    orgId: user.orgId,
    clientId: client.id,
    leadId: lead.id,
    name: eventName,
    type: lead.eventType || "other",
    eventDate: lead.eventDate || null,
    guestCount: lead.guestCount || null,
    budget: lead.estimatedBudget || null,
    assignedTo: user.id,
  }).returning();

  // Mark lead as converted
  await db.update(leads).set({
    status: "converted",
    convertedAt: new Date(),
    convertedToEventId: event.id,
    updatedAt: new Date(),
  }).where(eq(leads.id, leadId));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "lead.converted",
    entityType: "lead",
    entityId: leadId,
    summary: `Converted lead to event: ${event.name}`,
  });

  revalidatePath("/leads");
  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

// Returns { error } instead of throwing: Next.js masks thrown error messages
// in production, which is exactly how this used to fail silently in the UI.
export async function deleteLead(id: string): Promise<{ error?: string }> {
  const user = await requireRole("admin", "manager");

  const [lead] = await db.select().from(leads)
    .where(and(eq(leads.id, id), eq(leads.orgId, user.orgId))).limit(1);
  if (!lead) return { error: "Lead not found" };

  if (lead.status === "converted" || lead.convertedToEventId) {
    return { error: "Can't delete a converted lead — cancel or delete its event first." };
  }
  const [linkedEvent] = await db.select({ id: events.id }).from(events)
    .where(eq(events.leadId, id)).limit(1);
  if (linkedEvent) {
    return { error: "Can't delete this lead — an event is linked to it." };
  }

  // Comms reference the lead with no cascade; remove them first
  await db.delete(comms).where(eq(comms.leadId, id));
  await db.delete(leads).where(eq(leads.id, id));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "lead.deleted",
    entityType: "lead",
    entityId: id,
    summary: `Deleted lead: ${lead.name}`,
  });
  revalidatePath("/leads");
  return {};
}
