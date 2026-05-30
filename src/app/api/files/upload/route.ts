import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { uploadToStorage } from "@/lib/storage";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const user = await requireRole("admin", "manager", "coordinator");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId") as string | null;

    if (!file || file.size === 0) return NextResponse.json({ error: "No file selected" }, { status: 400 });
    if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large — maximum 50 MB" }, { status: 413 });

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
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
