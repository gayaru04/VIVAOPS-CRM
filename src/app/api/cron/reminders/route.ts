import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, clients, comms, npsResponses } from "@/lib/db/schema";
import { eq, and, inArray, notInArray } from "drizzle-orm";
import { sendEmail, eventReminderEmail, npsEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { randomUUID } from "crypto";

// Called daily by Vercel Cron (see vercel.json).
// Also callable manually: GET /api/cron/reminders?secret=<CRON_SECRET>
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const querySecret = new URL(req.url).searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  const isVercel = authHeader === `Bearer ${cronSecret}`;
  const isManual = querySecret === cronSecret;
  if (!isVercel && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const in7 = new Date(today); in7.setDate(today.getDate() + 7);
  const in1 = new Date(today); in1.setDate(today.getDate() + 1);
  // NPS: events that ended exactly 2 days ago
  const minus2 = new Date(today); minus2.setDate(today.getDate() - 2);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const results: Array<{ event: string; channel: string; status: string }> = [];

  // ── 1. Upcoming reminders (7-day and 1-day) ──────────────────────────────
  const upcoming = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(
      and(
        inArray(events.eventDate, [fmt(in7), fmt(in1)]),
        inArray(events.stage, ["confirmed", "planning", "contract"])
      )
    );

  for (const { event, client } of upcoming) {
    if (!client?.email) continue;

    const daysAway = event.eventDate === fmt(in1) ? 1 : 7;
    const fmtDate = (d: string | null) =>
      d ? new Date(d).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null;

    const subject = daysAway === 1
      ? `Your event is tomorrow – ${event.name}`
      : `Your event is 7 days away – ${event.name}`;

    const html = eventReminderEmail({
      clientName: client.name,
      eventName: event.name,
      eventDate: fmtDate(event.eventDate),
      venue: event.venue,
      daysAway,
    });

    try {
      const result = await sendEmail({ to: client.email, subject, html });

      await db.insert(comms).values({
        orgId: event.orgId,
        type: "email",
        direction: "outbound",
        subject,
        body: `Automated ${daysAway}-day reminder sent to ${client.email}${result.skipped ? " (skipped — API key not set)" : ""}`,
        eventId: event.id,
        clientId: client.id,
        sentBy: null,
      });

      await logAudit({
        orgId: event.orgId,
        actor: null,
        action: "reminder.auto_sent",
        entityType: "event",
        entityId: event.id,
        summary: `Auto ${daysAway}d reminder → ${client.email}`,
      });

      results.push({ event: event.name, channel: client.email, status: result.skipped ? "skipped" : "sent" });
    } catch (err) {
      results.push({ event: event.name, channel: client.email, status: `error: ${err}` });
    }
  }

  // ── 2. Post-event NPS surveys (2 days after event) ────────────────────────
  // Find completed events from 2 days ago that haven't had an NPS sent yet
  const alreadySent = await db.select({ eventId: npsResponses.eventId }).from(npsResponses);
  const alreadySentIds = alreadySent.map((r) => r.eventId);

  const npsFilter = alreadySentIds.length > 0
    ? and(
        eq(events.eventDate, fmt(minus2)),
        inArray(events.stage, ["completed"]),
        notInArray(events.id, alreadySentIds)
      )
    : and(
        eq(events.eventDate, fmt(minus2)),
        inArray(events.stage, ["completed"])
      );

  const npsEvents = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(npsFilter);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vivaops.app";

  for (const { event, client } of npsEvents) {
    if (!client?.email) continue;

    const token = randomUUID();

    try {
      await db.insert(npsResponses).values({
        eventId: event.id,
        orgId: event.orgId,
        token,
      });

      const surveyUrl = `${appUrl}/survey/${token}`;
      const subject = `How did your event go? – ${event.name}`;
      const html = npsEmail({ clientName: client.name, eventName: event.name, surveyUrl });

      const result = await sendEmail({ to: client.email, subject, html });

      await db.insert(comms).values({
        orgId: event.orgId,
        type: "email",
        direction: "outbound",
        subject,
        body: `NPS survey sent to ${client.email}${result.skipped ? " (skipped)" : ""}`,
        eventId: event.id,
        clientId: client.id,
        sentBy: null,
      });

      results.push({ event: event.name, channel: client.email, status: result.skipped ? "nps-skipped" : "nps-sent" });
    } catch (err) {
      results.push({ event: event.name, channel: client.email, status: `nps-error: ${err}` });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
