import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, organisations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { User } from "@/lib/db/schema";

export type SessionUser = User;

export async function getUser(): Promise<SessionUser | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

  // Auto-provision profile for new sign-ups
  if (!dbUser) {
    const [org] = await db.select().from(organisations).limit(1);
    if (!org) return null;
    [dbUser] = await db.insert(users).values({
      id: user.id,
      orgId: org.id,
      email: user.email!,
      name: user.user_metadata?.name ?? user.email!.split("@")[0],
      role: "coordinator",
    }).returning();
  }

  return dbUser ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

type Role = "admin" | "manager" | "coordinator" | "viewer";
const roleWeight: Record<Role, number> = {
  admin: 4,
  manager: 3,
  coordinator: 2,
  viewer: 1,
};

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role as Role)) {
    redirect("/forbidden");
  }
  return user;
}

export const can = {
  manage: (user: SessionUser) =>
    roleWeight[user.role as Role] >= roleWeight.manager,
  admin: (user: SessionUser) =>
    roleWeight[user.role as Role] >= roleWeight.admin,
  edit: (user: SessionUser) =>
    roleWeight[user.role as Role] >= roleWeight.coordinator,
};
