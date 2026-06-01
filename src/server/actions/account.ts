"use server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Name is required");

  await db.update(users).set({ name }).where(eq(users.id, user.id));
  await logAudit({ orgId: user.orgId, actor: user.id, action: "account.profile_updated", entityType: "user", entityId: user.id, summary: `Updated profile name to "${name}"` });
  revalidatePath("/account");
}

export async function updatePassword(formData: FormData) {
  await requireUser();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 6) throw new Error("Password must be at least 6 characters");
  if (password !== confirm) throw new Error("Passwords do not match");

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}
