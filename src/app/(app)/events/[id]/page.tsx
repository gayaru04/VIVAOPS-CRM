import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  events, clients, tasks, comms, quotes, files,
  workOrders, suppliers, runSheetItems,
  checklistTemplates, eventChecklists, eventChecklistItems,
  eventStaff, npsResponses, users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtMoney, fmtTime } from "@/lib/utils";
import { updateEventStage, cloneEvent } from "@/server/actions/events";
import { updateTaskStatus } from "@/server/actions/tasks";
import { createComm } from "@/server/actions/comms";
import { createRunSheetItem } from "@/server/actions/run-sheet";
import { deleteFile } from "@/server/actions/files";
import { applyTemplateToEvent, toggleChecklistItem } from "@/server/actions/checklists";
import { addEventStaff, removeEventStaff } from "@/server/actions/staff";
import { updateQuoteStatus } from "@/server/actions/quotes";
import { FileUploadForm } from "./file-upload-form";
import { QuoteForm } from "./quote-form";
import { AiRunsheetButton } from "./ai-runsheet-button";
import { getSignedUrl } from "@/lib/storage";
import Link from "next/link";
import { CalendarDays, MapPin, Users, DollarSign, Plus, Copy, Download, Trash2, CheckSquare, Square, UserPlus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { sendEventReminder } from "@/server/actions/reminders";

const STAGES = ["inquiry", "proposal", "contract", "planning", "confirmed", "completed", "cancelled"] as const;

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();

  const [row] = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(and(eq(events.id, params.id), eq(events.orgId, user.orgId)))
    .limit(1);
  if (!row) notFound();

  const { event, client } = row;

  const [eventTasks, eventComms, eventQuotes, rawFiles, eventWOs, eventRunSheet, eventChecklistsRaw, allTemplates, staffRows, npsRow, orgUsers] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.eventId, event.id)),
    db.select().from(comms).where(eq(comms.eventId, event.id)).orderBy(comms.sentAt),
    db.select().from(quotes).where(eq(quotes.eventId, event.id)).orderBy(quotes.createdAt),
    db.select().from(files).where(eq(files.eventId, event.id)).orderBy(files.createdAt),
    db.select({ wo: workOrders, supplier: suppliers })
      .from(workOrders)
      .leftJoin(suppliers, eq(workOrders.supplierId, suppliers.id))
      .where(eq(workOrders.eventId, event.id)),
    db.select().from(runSheetItems).where(eq(runSheetItems.eventId, event.id)).orderBy(runSheetItems.time),
    db.select().from(eventChecklists).where(eq(eventChecklists.eventId, event.id)),
    db.select().from(checklistTemplates).where(eq(checklistTemplates.orgId, user.orgId)),
    db.select({ staff: eventStaff, member: users })
      .from(eventStaff)
      .leftJoin(users, eq(eventStaff.userId, users.id))
      .where(eq(eventStaff.eventId, event.id)),
    db.select().from(npsResponses).where(eq(npsResponses.eventId, event.id)).limit(1),
    db.select().from(users).where(eq(users.orgId, user.orgId)),
  ]);

  // Attach signed URLs to files
  const eventFiles = await Promise.all(
    rawFiles.map(async (f) => {
      try {
        const url = await getSignedUrl(f.storagePath);
        return { ...f, url };
      } catch {
        return { ...f, url: null };
      }
    })
  );

  // Attach items to each checklist
  const eventChecklists2 = await Promise.all(
    eventChecklistsRaw.map(async (cl) => {
      const items = await db
        .select()
        .from(eventChecklistItems)
        .where(eq(eventChecklistItems.checklistId, cl.id))
        .orderBy(eventChecklistItems.sortOrder);
      return { ...cl, items };
    })
  );

  const totalChecklistItems = eventChecklists2.reduce((s, cl) => s + cl.items.length, 0);

  // Budget vs actual
  const totalSpend = eventWOs.reduce((s, { wo }) => s + Number(wo.amount ?? 0), 0);
  const budget = Number(event.budget ?? 0);
  const budgetVariance = budget - totalSpend;

  // NPS
  const nps = npsRow[0] ?? null;

  // Staff not yet assigned (for dropdown)
  const assignedUserIds = new Set(staffRows.map((r) => r.staff.userId));
  const unassignedUsers = orgUsers.filter((u) => !assignedUserIds.has(u.id));

  const daysToGo = event.eventDate
    ? Math.ceil((new Date(event.eventDate).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero */}
      <div className="px-7 pt-6 pb-5 border-b border-border"
        style={{ background: "radial-gradient(120% 80% at 100% 0%, hsl(252 70% 97%) 0%, transparent 55%), hsl(var(--background))" }}>
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-1.5">
              {event.type?.toUpperCase()} · <StatusBadge status={event.stage} />
            </p>
            <h1 className="text-[30px] font-semibold tracking-[-0.025em] text-foreground leading-tight">{event.name}</h1>
            {client?.name && <p className="text-[14px] text-text-3 mt-0.5">{client.name}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-[12.5px] text-text-2">
              {event.eventDate && (
                <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-text-3" />{fmtDate(event.eventDate)}</span>
              )}
              {event.venue && (
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-text-3" />{event.venue}</span>
              )}
              {event.guestCount && (
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-text-3" />{event.guestCount} guests</span>
              )}
              {event.budget && (
                <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-text-3" />Budget {fmtMoney(event.budget)}</span>
              )}
            </div>
          </div>

          {/* Countdown + actions */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {daysToGo !== null && (
              <div className="flex items-center gap-3.5 border border-border bg-surface rounded-xl px-4 py-3 shadow-soft">
                <span className="text-[30px] font-semibold tabular-nums tracking-tight text-foreground leading-none">
                  {daysToGo > 0 ? daysToGo : 0}
                </span>
                <div className="text-[11px] leading-snug text-text-3 uppercase tracking-[0.07em] font-semibold">
                  <span className="block text-foreground text-[13px] normal-case font-semibold tracking-normal">
                    {daysToGo > 0 ? "Days to go" : daysToGo === 0 ? "Today!" : "Past event"}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-2 flex-wrap justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${event.id}/edit`}>Edit</Link>
              </Button>
              {event.eventDate && (
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/events/${event.id}/ical`} download>
                    <CalendarDays className="h-3.5 w-3.5" /> Add to Calendar
                  </a>
                </Button>
              )}
              <form action={cloneEvent.bind(null, event.id)}>
                <SubmitButton variant="outline" size="sm" pendingText="Cloning…">
                  <Copy className="h-3.5 w-3.5" /> Clone
                </SubmitButton>
              </form>
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${event.id}/run-sheet`}>Print run sheet</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/event-day">Open event day</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stage picker */}
        <div className="flex items-center gap-1.5 mt-4 flex-wrap">
          {STAGES.map((stage) => (
            <form key={stage} action={updateEventStage}>
              <input type="hidden" name="eventId" value={event.id} />
              <input type="hidden" name="stage" value={stage} />
              <SubmitButton className={`h-[26px] px-2.5 rounded-[5px] text-[12px] font-medium border ${
                event.stage === stage
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-3 hover:bg-hover hover:text-foreground"
              }`}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </SubmitButton>
            </form>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex flex-col flex-1 min-h-0">
        <TabsList className="px-7 border-b border-border bg-background rounded-none justify-start h-auto py-0 gap-0">
          {[
            ["overview",    "Overview"],
            ["tasks",       `Tasks (${eventTasks.length})`],
            ["comms",       `Comms (${eventComms.length})`],
            ["quotes",      `Quotes (${eventQuotes.length})`],
            ["files",       `Files (${eventFiles.length})`],
            ["checklists",  `Checklists (${totalChecklistItems})`],
            ["workorders",  `Work Orders (${eventWOs.length})`],
            ["runsheet",    `Run Sheet (${eventRunSheet.length})`],
            ["staff",       `Staff (${staffRows.length})`],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-text-3 px-4 py-3 text-[13px] font-medium bg-transparent shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="px-7 py-5 flex-1">
          <TabsContent value="overview">
            <div className="flex flex-col gap-5 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                  {[
                    ["Client",  client?.name],
                    ["Date",    fmtDate(event.eventDate)],
                    ["Venue",   event.venue],
                    ["Guests",  event.guestCount?.toString()],
                    ["Budget",  fmtMoney(event.budget)],
                  ].filter(([, v]) => v).map(([label, value], i) => (
                    <div key={label as string} className={`grid grid-cols-[120px_1fr] gap-3 px-4 py-2.5 text-[13px] ${i !== 0 ? "border-t border-border" : ""}`}>
                      <span className="text-text-3">{label}</span>
                      <span className="text-foreground font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-5">
                  {event.notes && (
                    <div className="bg-surface border border-border rounded-lg p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-2">Notes</p>
                      <p className="text-[13px] text-foreground whitespace-pre-wrap">{event.notes}</p>
                    </div>
                  )}

                  {/* Budget vs Actual */}
                  {budget > 0 && (
                    <div className="bg-surface border border-border rounded-lg overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3">Budget vs Actual</p>
                      </div>
                      {[
                        ["Budget",   fmtMoney(event.budget)],
                        ["WO Spend", fmtMoney(totalSpend.toString())],
                        ["Variance", fmtMoney(Math.abs(budgetVariance).toString())],
                      ].map(([label, value], i) => (
                        <div key={label as string} className={`grid grid-cols-[100px_1fr] gap-3 px-4 py-2.5 text-[13px] ${i !== 0 ? "border-t border-border" : ""}`}>
                          <span className="text-text-3">{label}</span>
                          <span className={`font-medium tabular-nums ${label === "Variance" ? (budgetVariance >= 0 ? "text-green-500" : "text-red-500") : "text-foreground"}`}>
                            {label === "Variance" ? (budgetVariance >= 0 ? "+" : "-") : ""}{value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* NPS score */}
                  {nps && nps.score !== null && (
                    <div className="bg-surface border border-border rounded-lg p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-2">Client Satisfaction</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[32px] font-semibold tabular-nums text-foreground leading-none">{nps.score}</span>
                        <span className="text-[13px] text-text-3">/ 10</span>
                        <div className="flex gap-1 ml-1">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className={`h-2 w-2 rounded-full ${i < (nps.score ?? 0) ? "bg-primary" : "bg-surface-3"}`} />
                          ))}
                        </div>
                      </div>
                      {nps.comment && <p className="text-[12px] text-text-3 mt-2 italic">&ldquo;{nps.comment}&rdquo;</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Reminders */}
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3">Send Reminder</p>
                </div>

                {/* Quick sends */}
                <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-border">
                  {[
                    { type: "confirmation", label: "Confirmation" },
                    { type: "reminder_7d",  label: "7-day reminder" },
                    { type: "reminder_1d",  label: "Day-before" },
                  ].map(({ type, label }) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <form action={sendEventReminder}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="channel" value="email" />
                        <SubmitButton variant="outline" size="sm" pendingText="Sending…">
                          ✉ {label}
                        </SubmitButton>
                      </form>
                      <form action={sendEventReminder}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="channel" value="sms" />
                        <SubmitButton variant="outline" size="sm" pendingText="Sending…">
                          💬 SMS
                        </SubmitButton>
                      </form>
                    </div>
                  ))}
                </div>

                {/* Custom message */}
                <form action={sendEventReminder} className="px-4 py-3 flex flex-col gap-3">
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="type" value="custom" />
                  <div className="flex gap-3">
                    <input
                      name="subject"
                      required
                      placeholder="Subject…"
                      className="flex h-9 flex-1 rounded-md border border-border bg-surface px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <SelectInput name="channel" className="w-24 flex-shrink-0">
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </SelectInput>
                  </div>
                  <Textarea name="body" required placeholder="Message body…" rows={3} />
                  <div>
                    <SubmitButton size="sm" pendingText="Sending…">Send Custom</SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="flex flex-col gap-3 max-w-2xl">
              <div className="flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/tasks/new?eventId=${event.id}`}><Plus className="h-3.5 w-3.5" />Add Task</Link>
                </Button>
              </div>
              {eventTasks.length === 0
                ? <p className="text-[13px] text-text-3">No tasks yet.</p>
                : eventTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{task.title}</p>
                      {task.dueDate && <p className="text-[11.5px] text-text-3 tabular-nums">{fmtDate(task.dueDate)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.status} />
                      {(task.status === "todo" || task.status === "in_progress") && (
                        <form action={updateTaskStatus.bind(null, task.id, "done")}>
                          <SubmitButton className="h-7 px-2.5 text-[12px] font-medium rounded-md border border-border text-text-3 hover:bg-hover hover:text-foreground">
                            Done
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="comms">
            <div className="flex flex-col gap-3 max-w-2xl">
              {/* Quick log form */}
              <form action={createComm} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="direction" value="outbound" />
                <div className="flex gap-3">
                  <SelectInput name="type" className="w-40 flex-shrink-0">
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="note">Note</option>
                    <option value="meeting">Meeting</option>
                  </SelectInput>
                  <input
                    name="subject"
                    placeholder="Subject (optional)"
                    className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <Textarea name="body" required placeholder="Log what was communicated…" rows={3} />
                <div>
                  <SubmitButton size="sm">Log Comm</SubmitButton>
                </div>
              </form>

              {eventComms.length === 0
                ? <p className="text-[13px] text-text-3">No comms logged yet.</p>
                : eventComms.map((c) => (
                  <div key={c.id} className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12.5px] font-medium capitalize text-foreground">{c.type}</span>
                      <span className="text-[11.5px] text-text-3">{c.direction}</span>
                      {c.isInternal && (
                        <span className="text-[10.5px] font-medium bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">Internal</span>
                      )}
                      <span className="ml-auto text-[11.5px] text-text-3 tabular-nums">{fmtDate(c.sentAt.toISOString())}</span>
                    </div>
                    {c.subject && <p className="text-[12.5px] font-medium text-foreground mb-1">{c.subject}</p>}
                    <p className="text-[13px] text-text-2 whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="quotes">
            <div className="flex flex-col gap-5 max-w-3xl">
              {/* Existing quotes */}
              {eventQuotes.map((q) => (
                <div key={q.id} className="bg-surface border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground tabular-nums">{q.number}</p>
                      <p className="text-[11.5px] text-text-3 mt-0.5">
                        Total: <span className="font-medium text-foreground">{fmtMoney(q.total)}</span>
                        {q.validUntil ? ` · Valid until ${fmtDate(q.validUntil)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={q.status} />
                      <Button asChild variant="outline" size="sm" className="h-6 px-2 text-[11px]">
                        <a href={`/api/quotes/${q.id}/pdf`} download>
                          <Download className="h-3 w-3" /> PDF
                        </a>
                      </Button>
                      {(["draft","sent","accepted","rejected","expired"] as const).map((s) => s !== q.status && (
                        <form key={s} action={updateQuoteStatus.bind(null, q.id, s)}>
                          <SubmitButton variant="outline" size="sm" className="h-6 px-2 text-[11px] capitalize">{s}</SubmitButton>
                        </form>
                      ))}
                    </div>
                  </div>
                  {q.notes && <p className="px-4 py-2.5 text-[12px] text-text-3 border-b border-border">{q.notes}</p>}
                  <div className="divide-y divide-border">
                    {((q.lineItems as Array<{description:string;qty:number;rate:number;amount:number}>) ?? []).map((li, i) => (
                      <div key={i} className="grid grid-cols-[1fr_60px_90px_90px] gap-3 px-4 py-2.5 text-[13px]">
                        <span className="text-foreground">{li.description}</span>
                        <span className="text-text-3 text-right tabular-nums">{li.qty}</span>
                        <span className="text-text-3 text-right tabular-nums">{fmtMoney(String(li.rate ?? 0))}</span>
                        <span className="text-foreground text-right tabular-nums font-medium">{fmtMoney(String(li.amount ?? 0))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* New quote form */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">New Quote</p>
                <QuoteForm eventId={event.id} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div className="flex flex-col gap-4 max-w-2xl">
              <FileUploadForm eventId={event.id} />
              {eventFiles.length === 0
                ? <p className="text-[13px] text-text-3">No files uploaded yet.</p>
                : (
                  <div className="border border-border rounded-lg overflow-hidden bg-surface divide-y divide-border">
                    {eventFiles.map((f) => (
                      <div key={f.id} className="flex items-center justify-between px-4 py-3 gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">{f.name}</p>
                          <p className="text-[11.5px] text-text-3 mt-0.5">
                            {f.size ? `${(f.size / 1024).toFixed(0)} KB · ` : ""}
                            {fmtDate(f.createdAt.toISOString())}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {f.url && (
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 h-7 px-2.5 rounded border border-border bg-surface text-[12px] text-foreground hover:bg-hover transition-colors"
                            >
                              <Download className="h-3 w-3" /> Download
                            </a>
                          )}
                          <form action={deleteFile.bind(null, f.id)}>
                            <SubmitButton variant="outline" size="sm" pendingText="…" className="h-7 px-2 text-red-500 hover:text-red-600 border-border">
                              <Trash2 className="h-3 w-3" />
                            </SubmitButton>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </TabsContent>

          <TabsContent value="checklists">
            <div className="flex flex-col gap-5 max-w-2xl">
              {/* Apply template */}
              {allTemplates.length > 0 && (
                <form action={applyTemplateToEvent} className="flex items-center gap-3">
                  <input type="hidden" name="eventId" value={event.id} />
                  <SelectInput name="templateId" className="flex-1 max-w-xs" required>
                    <option value="">Select a template…</option>
                    {allTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </SelectInput>
                  <SubmitButton size="sm" pendingText="Applying…">Apply Template</SubmitButton>
                  <Link href="/checklists" className="text-[12px] text-text-3 hover:text-foreground underline underline-offset-2">Manage templates</Link>
                </form>
              )}
              {allTemplates.length === 0 && (
                <p className="text-[13px] text-text-3">
                  No templates yet. <Link href="/checklists" className="underline underline-offset-2 hover:text-foreground">Create one in Checklists.</Link>
                </p>
              )}

              {/* Checklists */}
              {eventChecklists2.length === 0
                ? <p className="text-[13px] text-text-3">No checklists applied to this event.</p>
                : eventChecklists2.map((cl) => (
                  <div key={cl.id} className="border border-border rounded-lg overflow-hidden bg-surface">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-[13px] font-semibold text-foreground">{cl.name}</p>
                      <p className="text-[11.5px] text-text-3 mt-0.5">
                        {cl.items.filter((i) => i.status === "done").length}/{cl.items.length} done
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {cl.items.map((item) => (
                        <form key={item.id} action={toggleChecklistItem.bind(null, item.id, event.id, item.status)}>
                          <button type="submit" className="w-full flex items-start gap-3 px-4 py-3 hover:bg-hover transition-colors text-left">
                            {item.status === "done"
                              ? <CheckSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              : <Square className="h-4 w-4 text-text-3 mt-0.5 flex-shrink-0" />
                            }
                            <div className="min-w-0">
                              <p className={`text-[13px] ${item.status === "done" ? "line-through text-text-3" : "text-foreground"}`}>{item.title}</p>
                              {item.description && <p className="text-[11.5px] text-text-3 mt-0.5">{item.description}</p>}
                            </div>
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </TabsContent>

          <TabsContent value="workorders">
            <div className="flex flex-col gap-3 max-w-2xl">
              <div className="flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/work-orders/new?eventId=${event.id}`}><Plus className="h-3.5 w-3.5" />Issue Work Order</Link>
                </Button>
              </div>
              {eventWOs.length === 0
                ? <p className="text-[13px] text-text-3">No work orders yet.</p>
                : eventWOs.map(({ wo, supplier }) => (
                  <div key={wo.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{supplier?.name ?? "—"}</p>
                      <p className="text-[11.5px] text-text-3 font-mono tabular-nums">{wo.number} · {fmtMoney(wo.amount)}</p>
                    </div>
                    <StatusBadge status={wo.status} />
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="runsheet">
            <div className="flex flex-col gap-3 max-w-2xl">
              {/* AI generator */}
              <AiRunsheetButton eventId={event.id} existingCount={eventRunSheet.length} />

              {/* Add item form */}
              <form action={createRunSheetItem} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="sortOrder" value={eventRunSheet.length} />
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 w-28 flex-shrink-0">
                    <label className="text-[11px] font-medium text-text-3">Time *</label>
                    <input
                      name="time"
                      type="time"
                      required
                      className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-[13px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[11px] font-medium text-text-3">Title *</label>
                    <input
                      name="title"
                      required
                      placeholder="e.g. Ceremony begins"
                      className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <input
                  name="description"
                  placeholder="Notes (optional)"
                  className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div>
                  <SubmitButton size="sm">Add Item</SubmitButton>
                </div>
              </form>

              {/* Items list */}
              <div className="border border-border rounded-lg overflow-hidden bg-surface">
                {eventRunSheet.length === 0
                  ? <p className="text-[13px] text-text-3 px-4 py-3">No items yet.</p>
                  : eventRunSheet.map((item, i) => (
                    <div key={item.id} className={`grid grid-cols-[70px_1fr] gap-3 px-4 py-3 text-[13px] ${i !== 0 ? "border-t border-border" : ""}`}>
                      <span className="font-mono text-[12px] text-text-3 tabular-nums pt-0.5">{fmtTime(item.time)}</span>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        {item.description && <p className="text-[11.5px] text-text-3 mt-0.5">{item.description}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* ── Staff ── */}
          <TabsContent value="staff">
            <div className="flex flex-col gap-4 max-w-2xl">
              {/* Current staff */}
              <div className="border border-border rounded-lg overflow-hidden bg-surface">
                {staffRows.length === 0 ? (
                  <p className="text-[13px] text-text-3 px-4 py-4">No staff assigned yet.</p>
                ) : (
                  staffRows.map(({ staff, member }, i) => (
                    <div key={staff.id} className={`flex items-center gap-3 px-4 py-3 text-[13px] ${i !== 0 ? "border-t border-border" : ""}`}>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10.5px] font-semibold flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, hsl(252 60% 55%), hsl(312 70% 60%))" }}
                      >
                        {(member?.name ?? "?").split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{member?.name ?? "Unknown"}</p>
                        <p className="text-[11.5px] text-text-3 capitalize">{staff.role}{staff.notes ? ` · ${staff.notes}` : ""}</p>
                      </div>
                      <form action={removeEventStaff.bind(null, staff.id, event.id)}>
                        <button type="submit" className="text-text-3 hover:text-destructive transition-colors p-1 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>

              {/* Assign staff form */}
              {unassignedUsers.length > 0 && (
                <form action={addEventStaff} className="border border-border rounded-lg p-4 bg-surface flex flex-col gap-3">
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="orgId" value={event.orgId} />
                  <p className="text-[13px] font-medium text-foreground flex items-center gap-2">
                    <UserPlus className="h-3.5 w-3.5 text-primary" /> Assign team member
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-text-3">Team member *</label>
                      <SelectInput name="userId" required>
                        <option value="">Select person…</option>
                        {unassignedUsers.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </SelectInput>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-text-3">Role *</label>
                      <SelectInput name="role" required>
                        <option value="">Select role…</option>
                        {["coordinator", "host", "technician", "photographer", "security", "waitstaff", "other"].map((r) => (
                          <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </SelectInput>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-3">Notes (optional)</label>
                    <input
                      name="notes"
                      placeholder="e.g. Arrive by 3pm, bring own equipment"
                      className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <SubmitButton size="sm">Assign</SubmitButton>
                  </div>
                </form>
              )}

              {unassignedUsers.length === 0 && staffRows.length > 0 && (
                <p className="text-[12px] text-text-3 text-center py-1">All team members assigned to this event.</p>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
