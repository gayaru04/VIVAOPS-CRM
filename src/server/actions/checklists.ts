"use server";
import { db } from "@/lib/db";
import {
  checklistTemplates,
  checklistTemplateItems,
  eventChecklists,
  eventChecklistItems,
} from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Templates ───────────────────────────────────────────────────────────────

export async function createTemplate(formData: FormData) {
  const user = await requireRole("admin", "manager");
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name?.trim()) throw new Error("Name is required");

  const [template] = await db
    .insert(checklistTemplates)
    .values({ orgId: user.orgId, name: name.trim(), description: description?.trim() || null, createdBy: user.id })
    .returning();

  await logAudit({ orgId: user.orgId, actor: user.id, action: "checklist_template.created", entityType: "checklist_template", entityId: template.id, summary: `Created template "${name}"` });
  redirect(`/checklists/${template.id}`);
}

export async function deleteTemplate(templateId: string) {
  const user = await requireRole("admin", "manager");
  const [t] = await db.select().from(checklistTemplates).where(and(eq(checklistTemplates.id, templateId), eq(checklistTemplates.orgId, user.orgId))).limit(1);
  if (!t) throw new Error("Template not found");

  await db.delete(checklistTemplateItems).where(eq(checklistTemplateItems.templateId, templateId));
  await db.delete(checklistTemplates).where(eq(checklistTemplates.id, templateId));

  await logAudit({ orgId: user.orgId, actor: user.id, action: "checklist_template.deleted", entityType: "checklist_template", entityId: templateId, summary: `Deleted template "${t.name}"` });
  revalidatePath("/checklists");
}

// ─── Template items ───────────────────────────────────────────────────────────

export async function addTemplateItem(formData: FormData) {
  const user = await requireRole("admin", "manager");
  const templateId = formData.get("templateId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;

  const [t] = await db.select().from(checklistTemplates).where(and(eq(checklistTemplates.id, templateId), eq(checklistTemplates.orgId, user.orgId))).limit(1);
  if (!t) throw new Error("Template not found");

  const existing = await db.select().from(checklistTemplateItems).where(eq(checklistTemplateItems.templateId, templateId));
  await db.insert(checklistTemplateItems).values({ templateId, title: title.trim(), description: description?.trim() || null, sortOrder: existing.length });

  revalidatePath(`/checklists/${templateId}`);
}

export async function deleteTemplateItem(itemId: string, templateId: string) {
  await requireRole("admin", "manager");
  await db.delete(checklistTemplateItems).where(eq(checklistTemplateItems.id, itemId));
  revalidatePath(`/checklists/${templateId}`);
}

// ─── Apply template to event ──────────────────────────────────────────────────

export async function applyTemplateToEvent(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const templateId = formData.get("templateId") as string;
  const eventId = formData.get("eventId") as string;

  const [template] = await db.select().from(checklistTemplates).where(and(eq(checklistTemplates.id, templateId), eq(checklistTemplates.orgId, user.orgId))).limit(1);
  if (!template) throw new Error("Template not found");

  const templateItems = await db.select().from(checklistTemplateItems).where(eq(checklistTemplateItems.templateId, templateId)).orderBy(checklistTemplateItems.sortOrder);

  const [checklist] = await db.insert(eventChecklists).values({ eventId, templateId, name: template.name }).returning();

  if (templateItems.length > 0) {
    await db.insert(eventChecklistItems).values(
      templateItems.map((item, i) => ({ checklistId: checklist.id, title: item.title, description: item.description, sortOrder: i }))
    );
  }

  await logAudit({ orgId: user.orgId, actor: user.id, action: "checklist.applied", entityType: "event", entityId: eventId, summary: `Applied template "${template.name}" (${templateItems.length} items)` });
  revalidatePath(`/events/${eventId}`);
}

// ─── Toggle checklist item ────────────────────────────────────────────────────

export async function toggleChecklistItem(itemId: string, eventId: string, currentStatus: string) {
  await requireRole("admin", "manager", "coordinator");
  const newStatus = currentStatus === "done" ? "pending" : "done";

  await db.update(eventChecklistItems)
    .set({ status: newStatus as "pending" | "done", completedAt: newStatus === "done" ? new Date() : null })
    .where(eq(eventChecklistItems.id, itemId));

  revalidatePath(`/events/${eventId}`);
}
