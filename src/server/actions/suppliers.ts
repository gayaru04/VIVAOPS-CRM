"use server";
import { db } from "@/lib/db";
import { suppliers } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { createSupplierSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSupplier(formData: FormData) {
  const user = await requireRole("admin", "manager");
  const data = createSupplierSchema.parse(Object.fromEntries(formData));

  const [supplier] = await db.insert(suppliers).values({
    orgId: user.orgId,
    name: data.name,
    category: data.category,
    contactName: data.contactName || null,
    email: data.email || null,
    phone: data.phone || null,
    website: data.website || null,
    address: data.address || null,
    notes: data.notes || null,
    isPreferred: data.isPreferred,
  }).returning();

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "supplier.created",
    entityType: "supplier",
    entityId: supplier.id,
    summary: `Created supplier: ${supplier.name}`,
  });

  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplier.id}`);
}

export async function updateSupplier(id: string, formData: FormData) {
  const user = await requireRole("admin", "manager");
  const data = createSupplierSchema.partial().parse(Object.fromEntries(formData));

  await db.update(suppliers).set({ ...data, updatedAt: new Date() }).where(eq(suppliers.id, id));

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "supplier.updated",
    entityType: "supplier",
    entityId: id,
    summary: `Updated supplier`,
  });

  revalidatePath(`/suppliers/${id}`);
  revalidatePath("/suppliers");
  redirect(`/suppliers/${id}`);
}
