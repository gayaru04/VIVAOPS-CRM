"use server";
import { db } from "@/lib/db";
import { events, eventStageHistory, tasks, runSheetItems, clients, comms } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createEventSchema, updateEventStageSchema } from "@/lib/validators";
import { sendEmail, eventConfirmationEmail } from "@/lib/email";
import { eq, and } from "drizzle-orm";
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

  // Auto-send confirmation email when stage moves to "confirmed"
  if (data.stage === "confirmed" && current.stage !== "confirmed" && current.clientId) {
    const [client] = await db.select().from(clients).where(eq(clients.id, current.clientId)).limit(1);
    if (client?.email) {
      const fmtDate = (d: string | null) =>
        d ? new Date(d).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null;
      const subject = `Your event is confirmed – ${current.name}`;
      const html = eventConfirmationEmail({
        clientName: client.name,
        eventName: current.name,
        eventDate: fmtDate(current.eventDate),
        venue: current.venue,
        guestCount: current.guestCount,
      });
      const result = await sendEmail({ to: client.email, subject, html });
      await db.insert(comms).values({
        orgId: user.orgId,
        type: "email",
        direction: "outbound",
        subject,
        body: `Auto-confirmation email sent to ${client.email}${result.skipped ? " (skipped — RESEND_API_KEY not set)" : ""}`,
        eventId: data.eventId,
        clientId: client.id,
        sentBy: user.id,
      });
    }
  }

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

export async function cloneEvent(eventId: string) {
  const user = await requireRole("admin", "manager", "coordinator");

  const [original] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.orgId, user.orgId)))
    .limit(1);
  if (!original) throw new Error("Event not found");

  const [originalTasks, originalRunSheet] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.eventId, eventId)),
    db.select().from(runSheetItems).where(eq(runSheetItems.eventId, eventId)),
  ]);

  const [newEvent] = await db
    .insert(events)
    .values({
      orgId: user.orgId,
      clientId: original.clientId,
      name: `Copy of ${original.name}`,
      type: original.type,
      stage: "inquiry",
      eventDate: null,
      venue: original.venue,
      venueAddress: original.venueAddress,
      guestCount: original.guestCount,
      budget: original.budget,
      notes: original.notes,
      assignedTo: user.id,
    })
    .returning();

  if (originalTasks.length > 0) {
    await db.insert(tasks).values(
      originalTasks.map((t) => ({
        orgId: user.orgId,
        eventId: newEvent.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: "todo" as const,
        createdBy: user.id,
      }))
    );
  }

  if (originalRunSheet.length > 0) {
    await db.insert(runSheetItems).values(
      originalRunSheet.map((r) => ({
        eventId: newEvent.id,
        time: r.time,
        title: r.title,
        description: r.description,
        sortOrder: r.sortOrder,
      }))
    );
  }

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "event.cloned",
    entityType: "event",
    entityId: newEvent.id,
    summary: `Cloned from "${original.name}"`,
  });

  revalidatePath("/events");
  redirect(`/events/${newEvent.id}`);
}
