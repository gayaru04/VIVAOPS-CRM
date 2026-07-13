"use server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { inviteUserSchema } from "@/lib/validators";
import { createAdminClient } from "@/lib/supabase/admin";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function inviteUser(formData: FormData) {
  const actor = await requireRole("admin");
  const data = inviteUserSchema.parse(Object.fromEntries(formData));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const admin = createAdminClient();
  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(data.email, {
    data: { name: data.name },
    redirectTo: `${appUrl}/set-password`,
  });
  if (error) throw new Error(error.message);

  const [user] = await db.insert(users).values({
    id: invited.user.id,
    orgId: actor.orgId,
    name: data.name,
    email: data.email,
    role: data.role,
  }).returning();

  await logAudit({
    orgId: actor.orgId,
    actor: actor.id,
    action: "user.invited",
    entityType: "user",
    entityId: user.id,
    summary: `Invited user: ${user.email} (${user.role})`,
  });

  revalidatePath("/settings/users");
}

export async function updateUserRole(id: string, role: "admin" | "manager" | "coordinator" | "viewer") {
  const actor = await requireRole("admin");
  await db.update(users).set({ role }).where(eq(users.id, id));

  await logAudit({
    orgId: actor.orgId,
    actor: actor.id,
    action: "user.role_changed",
    entityType: "user",
    entityId: id,
    summary: `User role → ${role}`,
  });

  revalidatePath("/settings/users");
}
