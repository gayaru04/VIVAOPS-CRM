import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { fmtMoney, fmtDate } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const STAGES = [
  { key: "inquiry",   label: "Inquiry",   color: "hsl(var(--st-slate))" },
  { key: "proposal",  label: "Proposal",  color: "hsl(var(--st-violet))" },
  { key: "contract",  label: "Contract",  color: "hsl(var(--st-amber))" },
  { key: "planning",  label: "Planning",  color: "hsl(var(--st-blue))" },
  { key: "confirmed", label: "Confirmed", color: "hsl(var(--st-green))" },
  { key: "completed", label: "Completed", color: "hsl(var(--st-green))" },
] as const;

export default async function PipelinePage() {
  const user = await requireUser();
  const rows = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(eq(events.orgId, user.orgId));

  const byStage = STAGES.reduce((acc, s) => {
    acc[s.key] = rows.filter((r) => r.event.stage === s.key);
    return acc;
  }, {} as Record<string, typeof rows>);

  const totalDeals = rows.length;
  const totalValue = rows.reduce((s, r) => s + Number(r.event.budget ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Pipeline"
        sub={`${totalDeals} active deals · ${fmtMoney(totalValue.toString())} forecast`}
      >
        <Button asChild size="sm">
          <Link href="/events/new"><Plus className="h-3 w-3" /> New deal</Link>
        </Button>
      </PageHeader>

      <div className="overflow-x-auto">
        <div className="flex gap-3 p-5 pb-8 min-w-max">
          {STAGES.map((stage) => {
            const stageRows = byStage[stage.key] ?? [];
            const stageValue = stageRows.reduce((s, r) => s + Number(r.event.budget ?? 0), 0);
            return (
              <div key={stage.key} className="w-[232px] flex flex-col bg-surface-2 border border-border rounded-lg min-h-0">
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="h-[7px] w-[7px] rounded-full flex-shrink-0" style={{ background: stage.color }} />
                    <span className="text-[12.5px] font-semibold text-foreground">{stage.label}</span>
                  </div>
                  <span className="text-[11.5px] text-text-3 tabular-nums">{stageRows.length}</span>
                  {stageValue > 0 && (
                    <span className="ml-auto text-[11px] text-text-3 tabular-nums">{fmtMoney(stageValue.toString())}</span>
                  )}
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-2 flex-1">
                  {stageRows.map(({ event, client }) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block bg-surface border border-border rounded-[7px] p-[10px] hover:border-border-strong shadow-soft transition-colors"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[13px] font-medium leading-snug text-foreground">{event.name}</span>
                      </div>
                      {client?.name && (
                        <p className="text-[11.5px] text-text-3 mt-1.5">{client.name}</p>
                      )}
                      {event.eventDate && (
                        <p className="text-[11.5px] text-text-3">{fmtDate(event.eventDate)}</p>
                      )}
                      {event.budget && (
                        <p className="text-[12.5px] font-medium tabular-nums text-foreground mt-1.5">{fmtMoney(event.budget)}</p>
                      )}
                    </Link>
                  ))}
                  <button className="flex items-center gap-1 self-start mt-0.5 px-2 py-1 text-[12px] text-text-3 hover:bg-hover hover:text-foreground rounded transition-colors">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
