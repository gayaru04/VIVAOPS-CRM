"use server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";

export async function createClientQuick(data: { name: string; email?: string; phone?: string }) {
  const user = await requireRole("admin", "manager", "coordinator");

  const [client] = await db.insert(clients).values({
    orgId: user.orgId,
    name: data.name,
    email: data.email ?? null,
    phone: data.phone ?? null,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "client.created",
    entityType: "client",
    entityId: client.id,
    summary: `Quick-created client: ${client.name}`,
  });

  return { id: client.id, name: client.name };
}
