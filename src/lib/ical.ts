function fmt(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escape(s: string) {
  return s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

export function generateICS({
  id,
  name,
  date,
  venue,
  description,
}: {
  id: string;
  name: string;
  date: string | null;
  venue: string | null;
  description?: string | null;
}): string | null {
  if (!date) return null;

  const start = new Date(date);
  start.setHours(9, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 0, 0, 0);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VivaOPS//VivaOPS CRM//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${id}@vivaops`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART;VALUE=DATE:${date.replace(/-/g, "")}`,
    `DTEND;VALUE=DATE:${date.replace(/-/g, "")}`,
    `SUMMARY:${escape(name)}`,
    venue ? `LOCATION:${escape(venue)}` : null,
    description ? `DESCRIPTION:${escape(description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];

  return lines.join("\r\n");
}
