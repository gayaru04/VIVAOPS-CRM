import { requireUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { db } from "@/lib/db";
import { leads, clients, events, tasks, suppliers, workOrders } from "@/lib/db/schema";
import { eq, and, count, inArray } from "drizzle-orm";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const [[leadCount], [clientCount], [eventCount], [openTaskCount], [supplierCount], [workOrderCount]] =
    await Promise.all([
      db.select({ count: count() }).from(leads).where(eq(leads.orgId, user.orgId)),
      db.select({ count: count() }).from(clients).where(eq(clients.orgId, user.orgId)),
      db.select({ count: count() }).from(events).where(eq(events.orgId, user.orgId)),
      db.select({ count: count() }).from(tasks).where(and(eq(tasks.orgId, user.orgId), inArray(tasks.status, ["todo", "in_progress"]))),
      db.select({ count: count() }).from(suppliers).where(eq(suppliers.orgId, user.orgId)),
      db.select({ count: count() }).from(workOrders).where(eq(workOrders.orgId, user.orgId)),
    ]);

  const navCounts: Record<string, number> = {
    "/pipeline": eventCount.count,
    "/leads": leadCount.count,
    "/clients": clientCount.count,
    "/events": eventCount.count,
    "/tasks": openTaskCount.count,
    "/suppliers": supplierCount.count,
    "/work-orders": workOrderCount.count,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userName={user.name} userRole={user.role} counts={navCounts} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
