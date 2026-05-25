"use server";
import { db } from "@/lib/db";
import { workOrders } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createWorkOrderSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function generateWONumber(): string {
  return `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
}

export async function createWorkOrder(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const data = createWorkOrderSchema.parse(Object.fromEntries(formData));

  const [wo] = await db.insert(workOrders).values({
    orgId: user.orgId,
    eventId: data.eventId,
    supplierId: data.supplierId,
    number: generateWONumber(),
    description: data.description || null,
    amount: data.amount || null,
    dueDate: data.dueDate || null,
    notes: data.notes || null,
    createdBy: user.id,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "work_order.created",
    entityType: "work_order",
    entityId: wo.id,
    summary: `Created work order ${wo.number}`,
  });

  revalidatePath(`/events/${data.eventId}`);
  revalidatePath("/work-orders");
}

export async function updateWorkOrderStatus(
  id: string,
  status: "draft" | "sent" | "confirmed" | "declined" | "completed"
) {
  const user = await requireRole("admin", "manager", "coordinator");
  const [wo] = await db.update(workOrders)
    .set({
      status,
      confirmedAt: status === "confirmed" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(workOrders.id, id))
    .returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "work_order.status_changed",
    entityType: "work_order",
    entityId: id,
    summary: `Work order status → ${status}`,
  });

  revalidatePath(`/events/${wo.eventId}`);
  revalidatePath("/work-orders");
}
