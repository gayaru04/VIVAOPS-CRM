"use server";
import { db } from "@/lib/db";
import { comms } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createCommSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createComm(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const data = createCommSchema.parse(Object.fromEntries(formData));

  const [comm] = await db.insert(comms).values({
    orgId: user.orgId,
    type: data.type,
    direction: data.direction,
    subject: data.subject || null,
    body: data.body,
    eventId: data.eventId || null,
    leadId: data.leadId || null,
    clientId: data.clientId || null,
    isInternal: data.isInternal,
    sentBy: user.id,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "comm.created",
    entityType: "comm",
    entityId: comm.id,
    summary: `Logged ${data.type} (${data.direction})`,
  });

  if (data.eventId) revalidatePath(`/events/${data.eventId}`);
  if (data.leadId) revalidatePath(`/leads/${data.leadId}`);
}
