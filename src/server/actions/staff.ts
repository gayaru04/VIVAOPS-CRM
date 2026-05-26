"use server";
import { db } from "@/lib/db";
import { eventStaff } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addEventStaff(formData: FormData) {
  const user = await requireRole("admin", "manager");
  const eventId = formData.get("eventId") as string;
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  const notes = (formData.get("notes") as string) || null;

  await db.insert(eventStaff).values({
    eventId,
    orgId: user.orgId,
    userId,
    role: role as "coordinator" | "host" | "technician" | "photographer" | "security" | "waitstaff" | "other",
    notes,
  });

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "event_staff.added",
    entityType: "event",
    entityId: eventId,
    summary: `Staff member assigned (${role})`,
  });

  revalidatePath(`/events/${eventId}`);
}

export async function removeEventStaff(staffId: string, eventId: string) {
  const user = await requireRole("admin", "manager");
  await db.delete(eventStaff).where(eq(eventStaff.id, staffId));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "event_staff.removed",
    entityType: "event",
    entityId: eventId,
    summary: `Staff member removed`,
  });

  revalidatePath(`/events/${eventId}`);
}
