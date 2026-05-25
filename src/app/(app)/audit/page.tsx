import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { fmtDate } from "@/lib/utils";

export default async function AuditPage() {
  const user = await requireRole("admin", "manager");

  const logs = await db
    .select({ log: auditLogs, actor: users })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actor, users.id))
    .where(eq(auditLogs.orgId, user.orgId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return (
    <>
      <PageHeader title="Audit Log" sub="Last 200 actions" />

      <div className="px-7 py-5">
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Time</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Actor</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Action</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-[13px] text-text-3">No audit events yet.</td>
                </tr>
              )}
              {logs.map(({ log, actor }) => (
                <tr key={log.id} className="hover:bg-hover transition-colors">
                  <td className="px-4 py-2.5 text-[12px] text-text-3 tabular-nums whitespace-nowrap">
                    {fmtDate(log.createdAt.toISOString())}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-foreground">{actor?.name ?? "System"}</td>
                  <td className="px-4 py-2.5 text-[12px] font-mono text-text-3">{log.action}</td>
                  <td className="px-4 py-2.5 text-[13px] text-foreground">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
