"use server";
import { db } from "@/lib/db";
import { events, eventStageHistory } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createEventSchema, updateEventStageSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const raw = Object.fromEntries(formData);
  const data = createEventSchema.parse(raw);

  const [event] = await db.insert(events).values({
    orgId: user.orgId,
    clientId: data.clientId,
    name: data.name,
    type: data.type,
    eventDate: data.eventDate || null,
    eventTime: data.eventTime || null,
    endTime: data.endTime || null,
    venue: data.venue || null,
    venueAddress: data.venueAddress || null,
    guestCount: data.guestCount ? Number(data.guestCount) : null,
    budget: data.budget || null,
    notes: data.notes || null,
    assignedTo: user.id,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "event.created",
    entityType: "event",
    entityId: event.id,
    summary: `Created event: ${event.name}`,
  });

  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function updateEventStage(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const data = updateEventStageSchema.parse(Object.fromEntries(formData));

  const [current] = await db.select().from(events).where(eq(events.id, data.eventId)).limit(1);
  if (!current) throw new Error("Event not found");

  await db.update(events).set({
    stage: data.stage,
    updatedAt: new Date(),
  }).where(eq(events.id, data.eventId));

  await db.insert(eventStageHistory).values({
    eventId: data.eventId,
    fromStage: current.stage,
    toStage: data.stage,
    changedBy: user.id,
    note: data.note || null,
  });

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "event.stage_changed",
    entityType: "event",
    entityId: data.eventId,
    summary: `Stage changed: ${current.stage} → ${data.stage}`,
  });

  revalidatePath(`/events/${data.eventId}`);
  revalidatePath("/events");
  revalidatePath("/pipeline");
}

export async function updateEvent(id: string, formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const raw = Object.fromEntries(formData);
  const data = createEventSchema.partial().parse(raw);

  await db.update(events).set({
    ...data,
    guestCount: data.guestCount ? Number(data.guestCount) : undefined,
    updatedAt: new Date(),
  }).where(eq(events.id, id));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "event.updated",
    entityType: "event",
    entityId: id,
    summary: `Updated event`,
  });

  revalidatePath(`/events/${id}`);
  revalidatePath("/events");
  redirect(`/events/${id}`);
}

export async function deleteEvent(id: string) {
  const user = await requireRole("admin", "manager");
  await db.delete(events).where(eq(events.id, id));
  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "event.deleted",
    entityType: "event",
    entityId: id,
    summary: `Deleted event`,
  });
  revalidatePath("/events");
  redirect("/events");
}
