import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function ClientsPage() {
  const user = await requireUser();
  const rows = await db.select().from(clients).where(eq(clients.orgId, user.orgId)).orderBy(desc(clients.createdAt));

  return (
    <>
      <PageHeader title="Clients" sub={`${rows.length} total`}>
        <Button asChild size="sm">
          <Link href="/clients/new"><Plus className="h-3.5 w-3.5" />New Client</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-5">
        {rows.length === 0 ? (
          <p className="text-[13px] text-text-3">No clients yet.</p>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Name</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Company</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Email</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Phone</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((client) => (
                  <tr key={client.id} className="hover:bg-hover transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`} className="text-[13px] font-medium text-foreground hover:text-primary transition-colors">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-3">{client.company || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-text-3">{client.email || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-text-3">{client.phone || "—"}</td>
                    <td className="px-4 py-3 text-[12px] text-text-3 tabular-nums">{fmtDate(client.createdAt.toISOString())}</td>
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
