"use server";
import { db } from "@/lib/db";
import { events, clients, comms } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { sendEmail, eventConfirmationEmail, eventReminderEmail, customEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ReminderType = "confirmation" | "reminder_7d" | "reminder_1d" | "custom";

export async function sendEventReminder(formData: FormData) {
  const user = await requireRole("admin", "manager", "coordinator");

  const eventId = formData.get("eventId") as string;
  const type = formData.get("type") as ReminderType;
  const channel = formData.get("channel") as "email" | "sms";
  const customSubject = formData.get("subject") as string | null;
  const customBody = formData.get("body") as string | null;

  // Fetch event + client
  const [row] = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(and(eq(events.id, eventId), eq(events.orgId, user.orgId)))
    .limit(1);

  if (!row) throw new Error("Event not found");
  const { event, client } = row;

  if (!client) throw new Error("No client linked to this event");

  const clientName = client.name;
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null;

  let subject = "";
  let emailHtml = "";
  let smsBody = "";

  if (type === "confirmation") {
    subject = `Your event is confirmed – ${event.name}`;
    emailHtml = eventConfirmationEmail({
      clientName,
      eventName: event.name,
      eventDate: fmtDate(event.eventDate),
      venue: event.venue,
      guestCount: event.guestCount,
    });
    smsBody = `Hi ${clientName}! Your event "${event.name}"${event.eventDate ? ` on ${fmtDate(event.eventDate)}` : ""} is confirmed. Looking forward to it! – VivaOPS`;

  } else if (type === "reminder_7d") {
    subject = `Your event is 7 days away – ${event.name}`;
    emailHtml = eventReminderEmail({ clientName, eventName: event.name, eventDate: fmtDate(event.eventDate), venue: event.venue, daysAway: 7 });
    smsBody = `Hi ${clientName}, a reminder that "${event.name}" is just 7 days away${event.eventDate ? ` (${fmtDate(event.eventDate)})` : ""}. Any questions? Get in touch! – VivaOPS`;

  } else if (type === "reminder_1d") {
    subject = `Your event is tomorrow – ${event.name}`;
    emailHtml = eventReminderEmail({ clientName, eventName: event.name, eventDate: fmtDate(event.eventDate), venue: event.venue, daysAway: 1 });
    smsBody = `Hi ${clientName}! Tomorrow is the big day – "${event.name}"${event.venue ? ` at ${event.venue}` : ""}. See you there! – VivaOPS`;

  } else if (type === "custom") {
    if (!customSubject || !customBody) throw new Error("Subject and body required for custom reminders");
    subject = customSubject;
    emailHtml = customEmail({ clientName, subject: customSubject, body: customBody });
    smsBody = customBody;
  }

  let sent = false;
  let skipped = false;
  let note = "";

  if (channel === "email") {
    if (!client.email) throw new Error("Client has no email address on file");
    const result = await sendEmail({ to: client.email, subject, html: emailHtml });
    sent = !result.skipped;
    skipped = result.skipped;
    note = skipped ? "Email skipped — RESEND_API_KEY not configured" : `Email sent to ${client.email}`;
  } else {
    if (!client.phone) throw new Error("Client has no phone number on file");
    const result = await sendSms({ to: client.phone, body: smsBody });
    sent = !result.skipped;
    skipped = result.skipped;
    note = skipped ? "SMS skipped — Twilio not configured" : `SMS sent to ${client.phone}`;
  }

  // Log as a comm
  await db.insert(comms).values({
    orgId: user.orgId,
    type: channel === "email" ? "email" : "sms",
    direction: "outbound",
    subject: subject || null,
    body: `${smsBody || subject}\n\n[${skipped ? "⚠ Not sent — integration not configured" : "✓ Sent"}]`,
    eventId: event.id,
    clientId: client.id,
    sentBy: user.id,
  });

  await logAudit({
    orgId: user.orgId,
    actor: user.id,
    action: "reminder.sent",
    entityType: "event",
    entityId: event.id,
    summary: `${channel.toUpperCase()} reminder (${type}) → ${client.email ?? client.phone} · ${note}`,
  });

  revalidatePath(`/events/${event.id}`);
}
