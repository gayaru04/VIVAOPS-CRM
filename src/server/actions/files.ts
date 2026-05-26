"use server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { uploadToStorage, deleteFromStorage } from "@/lib/storage";
import { logAudit } from "@/lib/audit";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function uploadFile(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const file = formData.get("file") as File;
  const eventId = formData.get("eventId") as string;

  if (!file || file.size === 0) throw new Error("No file selected");
  if (file.size > MAX_SIZE) throw new Error("File too large — maximum 50 MB");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.orgId}/${eventId}/${Date.now()}-${safeName}`;

  await uploadToStorage(storagePath, file);

  await db.insert(files).values({
    orgId: user.orgId,
    eventId,
    name: file.name,
    storagePath,
    mimeType: file.type || null,
    size: file.size,
    uploadedBy: user.id,
  });

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "file.uploaded",
    entityType: "event",
    entityId: eventId,
    summary: `Uploaded "${file.name}" (${(file.size / 1024).toFixed(0)} KB)`,
  });

  revalidatePath(`/events/${eventId}`);
}

export async function deleteFile(fileId: string) {
  const user = await requireRole("admin", "manager");

  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, fileId), eq(files.orgId, user.orgId)))
    .limit(1);

  if (!file) throw new Error("File not found");

  await deleteFromStorage(file.storagePath);
  await db.delete(files).where(eq(files.id, fileId));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "file.deleted",
    entityType: "event",
    entityId: file.eventId ?? undefined,
    summary: `Deleted "${file.name}"`,
  });

  if (file.eventId) revalidatePath(`/events/${file.eventId}`);
}
