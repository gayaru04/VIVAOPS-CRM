import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { suppliers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";

export default async function SuppliersPage() {
  const user = await requireUser();
  const rows = await db.select().from(suppliers).where(eq(suppliers.orgId, user.orgId)).orderBy(desc(suppliers.createdAt));

  return (
    <>
      <PageHeader title="Suppliers" sub={`${rows.length} total`}>
        <Button asChild size="sm">
          <Link href="/suppliers/new"><Plus className="h-3.5 w-3.5" />New Supplier</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-5">
        {rows.length === 0 ? (
          <p className="text-[13px] text-text-3">No suppliers yet.</p>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Name</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Category</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Contact</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Email</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Preferred</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-hover transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/suppliers/${s.id}`} className="text-[13px] font-medium text-foreground hover:text-primary transition-colors">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-3 capitalize">{s.category || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-text-3">{s.contactName || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-text-3">{s.email || "—"}</td>
                    <td className="px-4 py-3">
                      {s.isPreferred && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
