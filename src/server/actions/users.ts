"use server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { inviteUserSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function inviteUser(formData: FormData) {
  const actor = await requireRole("admin");
  const data = inviteUserSchema.parse(Object.fromEntries(formData));

  // NOTE: Supabase service role needed for admin operations.
  // Wire supabaseAdmin.auth.admin.createUser when SERVICE_ROLE_KEY is set.
  const tempPassword = `Viva${Math.random().toString(36).slice(2, 10)}!`;

  // Placeholder: in production, use supabase admin client to create the auth user
  // then insert the profile row below
  const [user] = await db.insert(users).values({
    id: crypto.randomUUID(),
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
