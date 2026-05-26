import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "VivaOPS <noreply@vivaops.app>";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — email skipped");
    return { id: null, skipped: true };
  }
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
  if (error) throw new Error(`Email send failed: ${error.message}`);
  return { id: data?.id ?? null, skipped: false };
}

// ─── Templates ──────────────────────────────────────────────────────────────

function wrap(body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f7;margin:0;padding:24px}
  .card{background:#fff;border-radius:12px;max-width:540px;margin:0 auto;padding:36px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  h1{font-size:22px;font-weight:600;color:#111;margin:0 0 8px}
  p{font-size:15px;color:#444;line-height:1.6;margin:0 0 16px}
  .meta{display:grid;grid-template-columns:120px 1fr;gap:6px 12px;margin:20px 0;font-size:14px}
  .meta .label{color:#888;font-weight:500}
  .meta .value{color:#111}
  .footer{margin-top:28px;padding-top:20px;border-top:1px solid #eee;font-size:13px;color:#aaa}
  .badge{display:inline-block;background:#f0edff;color:#6d4ed8;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:600}
</style></head><body>
<div class="card">${body}<div class="footer">VivaOPS · Event Management</div></div>
</body></html>`;
}

export function eventConfirmationEmail(data: {
  clientName: string;
  eventName: string;
  eventDate: string | null;
  venue: string | null;
  guestCount: number | null;
}) {
  return wrap(`
    <div class="badge">Event Confirmed</div>
    <h1 style="margin-top:14px">You're booked! 🎉</h1>
    <p>Hi ${data.clientName},</p>
    <p>We're thrilled to confirm your event. Here's a summary of the details we have on file:</p>
    <div class="meta">
      <span class="label">Event</span><span class="value">${data.eventName}</span>
      ${data.eventDate ? `<span class="label">Date</span><span class="value">${data.eventDate}</span>` : ""}
      ${data.venue ? `<span class="label">Venue</span><span class="value">${data.venue}</span>` : ""}
      ${data.guestCount ? `<span class="label">Guests</span><span class="value">${data.guestCount}</span>` : ""}
    </div>
    <p>If anything needs to be updated, please don't hesitate to reach out. We're looking forward to making your event unforgettable.</p>
  `);
}

export function eventReminderEmail(data: {
  clientName: string;
  eventName: string;
  eventDate: string | null;
  venue: string | null;
  daysAway: number;
}) {
  const timing = data.daysAway === 1 ? "tomorrow" : `in ${data.daysAway} days`;
  return wrap(`
    <div class="badge">${data.daysAway === 1 ? "Tomorrow!" : `${data.daysAway} Days Away`}</div>
    <h1 style="margin-top:14px">Your event is ${timing}</h1>
    <p>Hi ${data.clientName},</p>
    <p>Just a friendly reminder that <strong>${data.eventName}</strong> is coming up ${timing}${data.eventDate ? ` on <strong>${data.eventDate}</strong>` : ""}.</p>
    ${data.venue ? `<div class="meta"><span class="label">Venue</span><span class="value">${data.venue}</span></div>` : ""}
    <p>If you have any last-minute questions or changes, please get in touch as soon as possible.</p>
    <p>We can't wait to see you there!</p>
  `);
}

export function customEmail(data: {
  clientName: string;
  subject: string;
  body: string;
}) {
  return wrap(`
    <h1>${data.subject}</h1>
    <p>Hi ${data.clientName},</p>
    ${data.body.split("\n").map((line) => `<p>${line}</p>`).join("")}
  `);
}

export function npsEmail(data: {
  clientName: string;
  eventName: string;
  surveyUrl: string;
}) {
  return wrap(`
    <div class="badge">How did we do?</div>
    <h1 style="margin-top:14px">Thanks for choosing us, ${data.clientName}!</h1>
    <p>We hope <strong>${data.eventName}</strong> was everything you imagined. Your feedback helps us improve for every event we deliver.</p>
    <p>It only takes 30 seconds — click below to rate your experience:</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${data.surveyUrl}" style="display:inline-block;background:#6d4ed8;color:#fff;text-decoration:none;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600">
        Rate your experience →
      </a>
    </p>
    <p>Thank you — we truly value your feedback.</p>
  `);
}
