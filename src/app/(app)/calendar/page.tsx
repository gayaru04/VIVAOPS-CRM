import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { fmtDate } from "@/lib/utils";
import Link from "next/link";

export default async function CalendarPage() {
  const user = await requireUser();
  const rows = await db.select().from(events)
    .where(eq(events.orgId, user.orgId))
    .orderBy(events.eventDate);

  const withDate = rows.filter((e) => e.eventDate);

  return (
    <>
      <PageHeader title="Calendar" sub="Events by date" />

      <div className="px-7 py-5">
        {withDate.length === 0 ? (
          <p className="text-[13px] text-text-3">No events with dates scheduled.</p>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
            {withDate.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-hover transition-colors"
              >
                <div>
                  <p className="text-[13px] font-medium text-foreground">{event.name}</p>
                  <p className="text-[11.5px] text-text-3">
                    {fmtDate(event.eventDate)}{event.eventTime ? ` · ${event.eventTime}` : ""}
                  </p>
                  {event.venue && <p className="text-[11.5px] text-text-3">{event.venue}</p>}
                </div>
                <StatusBadge status={event.stage} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
