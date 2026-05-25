"use server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createTaskSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const data = createTaskSchema.parse(Object.fromEntries(formData));

  const [task] = await db.insert(tasks).values({
    orgId: user.orgId,
    title: data.title,
    description: data.description || null,
    eventId: data.eventId || null,
    priority: data.priority,
    dueDate: data.dueDate || null,
    assignedTo: data.assignedTo || null,
    createdBy: user.id,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "task.created",
    entityType: "task",
    entityId: task.id,
    summary: `Created task: ${task.title}`,
  });

  revalidatePath("/tasks");
  if (data.eventId) revalidatePath(`/events/${data.eventId}`);
}

export async function updateTaskStatus(id: string, status: "todo" | "in_progress" | "done" | "cancelled") {
  const user = await requireRole("admin", "manager", "coordinator");

  const [task] = await db.update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, id)).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "task.status_changed",
    entityType: "task",
    entityId: id,
    summary: `Task status → ${status}`,
  });

  revalidatePath("/tasks");
  if (task.eventId) revalidatePath(`/events/${task.eventId}`);
}

export async function deleteTask(id: string) {
  const user = await requireRole("admin", "manager");
  await db.delete(tasks).where(eq(tasks.id, id));
  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "task.deleted",
    entityType: "task",
    entityId: id,
    summary: `Deleted task`,
  });
  revalidatePath("/tasks");
}
