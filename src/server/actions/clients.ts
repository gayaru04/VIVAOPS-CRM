"use server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createClientSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClient(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const data = createClientSchema.parse(Object.fromEntries(formData));

  const [client] = await db.insert(clients).values({
    orgId: user.orgId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company: data.company || null,
    address: data.address || null,
    notes: data.notes || null,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "client.created",
    entityType: "client",
    entityId: client.id,
    summary: `Created client: ${client.name}`,
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");
  const data = createClientSchema.partial().parse(Object.fromEntries(formData));

  await db.update(clients).set({ ...data, updatedAt: new Date() }).where(eq(clients.id, id));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "client.updated",
    entityType: "client",
    entityId: id,
    summary: `Updated client`,
  });

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  redirect(`/clients/${id}`);
}
