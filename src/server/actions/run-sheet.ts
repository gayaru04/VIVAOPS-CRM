"use server";
import { db } from "@/lib/db";
import { runSheetItems } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createRunSheetItemSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createRunSheetItem(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const data = createRunSheetItemSchema.parse(Object.fromEntries(formData));

  const [item] = await db.insert(runSheetItems).values({
    eventId: data.eventId,
    time: data.time,
    duration: data.duration ? Number(data.duration) : null,
    title: data.title,
    description: data.description || null,
    location: data.location || null,
    assignedTo: data.assignedTo || null,
    supplierId: data.supplierId || null,
    sortOrder: data.sortOrder,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "run_sheet.item_created",
    entityType: "run_sheet_item",
    entityId: item.id,
    summary: `Added run sheet item: ${item.title}`,
  });

  revalidatePath(`/events/${data.eventId}`);
  revalidatePath(`/events/${data.eventId}/run-sheet`);
}

export async function deleteRunSheetItem(id: string, eventId: string) {
  const user = await requireRole("admin", "manager", "coordinator");
  await db.delete(runSheetItems).where(eq(runSheetItems.id, id));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "run_sheet.item_deleted",
    entityType: "run_sheet_item",
    entityId: id,
    summary: `Deleted run sheet item`,
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/run-sheet`);
}
