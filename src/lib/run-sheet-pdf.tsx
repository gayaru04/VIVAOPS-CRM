import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const purple = "#6d4ed8";
const black = "#111111";
const gray1 = "#444444";
const gray2 = "#888888";
const gray3 = "#d4d4d4";
const gray4 = "#f7f7f7";
const white = "#ffffff";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: black, paddingTop: 48, paddingBottom: 64, paddingHorizontal: 48, backgroundColor: white },

  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  label: { fontSize: 8, fontFamily: "Helvetica-Bold", color: purple, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 },
  title: { fontSize: 26, fontFamily: "Helvetica-Bold", color: black, letterSpacing: -0.5 },
  subtitle: { fontSize: 10, color: gray2, marginTop: 3 },
  logoBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: purple, justifyContent: "center", alignItems: "center" },
  logoText: { fontFamily: "Helvetica-Bold", fontSize: 16, color: white },
  metaRow: { flexDirection: "row", gap: 20, marginTop: 10, marginBottom: 16, fontSize: 9, color: gray2 },

  // Dividers
  dividerThick: { borderBottomWidth: 2, borderBottomColor: black, marginBottom: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: gray3, marginBottom: 20 },

  // Staff bar
  staffBox: { backgroundColor: gray4, borderRadius: 6, padding: "10px 12px", marginBottom: 20 },
  staffLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: gray2, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  staffList: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  staffChip: { fontSize: 9, color: gray1 },

  // Timeline row
  timelineRow: { flexDirection: "row", marginBottom: 0 },
  timeCol: { width: 58, flexShrink: 0, paddingTop: 13 },
  timeText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: purple, textAlign: "right" },
  durationText: { fontSize: 8, color: gray2, textAlign: "right", marginTop: 2 },
  dotCol: { width: 24, alignItems: "center", flexShrink: 0 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: purple, marginTop: 15 },
  line: { width: 1, flex: 1, backgroundColor: gray3, minHeight: 20 },
  contentCol: { flex: 1, paddingTop: 10, paddingBottom: 14, paddingLeft: 8 },
  itemTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: black },
  itemDesc: { fontSize: 9, color: gray1, marginTop: 3, lineHeight: 1.5 },
  itemMeta: { flexDirection: "row", gap: 14, marginTop: 4 },
  itemMetaText: { fontSize: 8, color: gray2 },

  // Footer
  footer: { position: "absolute", bottom: 28, left: 48, right: 48 },
  footerLine: { borderTopWidth: 0.5, borderTopColor: gray3, marginBottom: 7 },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: gray2 },
});

function fmtTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

interface Item {
  id: string; time: string; title: string; description: string | null;
  duration: number | null; location: string | null; assignedTo: string | null;
}
interface StaffRow { staff: { role: string }; member: { name: string } | null }

interface Props {
  event: { name: string; eventDate: string | null; venue: string | null; guestCount: number | null };
  client: { name: string } | null;
  items: Item[];
  staffRows: StaffRow[];
}

export function RunSheetPdf({ event, client, items, staffRows }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.label}>Run Sheet</Text>
            <Text style={s.title}>{event.name}</Text>
            {client?.name && <Text style={s.subtitle}>{client.name}</Text>}
          </View>
          <View style={s.logoBox}>
            <Text style={s.logoText}>V</Text>
          </View>
        </View>

        <View style={s.metaRow}>
          {event.eventDate && <Text>{fmtDate(event.eventDate)}</Text>}
          {event.venue && <Text>{event.venue}</Text>}
          {event.guestCount && <Text>{event.guestCount} guests</Text>}
        </View>

        <View style={s.dividerThick} />
        <View style={s.divider} />

        {/* Staff */}
        {staffRows.length > 0 && (
          <View style={s.staffBox}>
            <Text style={s.staffLabel}>Team on the day</Text>
            <View style={s.staffList}>
              {staffRows.map(({ staff, member }, i) => (
                <Text key={i} style={s.staffChip}>
                  {member?.name ?? "—"} ({staff.role}){i < staffRows.length - 1 ? "  ·  " : ""}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Timeline */}
        {items.length === 0 ? (
          <Text style={{ fontSize: 11, color: gray2, textAlign: "center", marginTop: 24 }}>No items in this run sheet.</Text>
        ) : (
          items.map((item, i) => (
            <View key={item.id} style={s.timelineRow}>
              <View style={s.timeCol}>
                <Text style={s.timeText}>{fmtTime(item.time)}</Text>
                {item.duration ? <Text style={s.durationText}>{item.duration}m</Text> : null}
              </View>
              <View style={s.dotCol}>
                <View style={s.dot} />
                {i < items.length - 1 && <View style={s.line} />}
              </View>
              <View style={s.contentCol}>
                <Text style={s.itemTitle}>{item.title}</Text>
                {item.description ? <Text style={s.itemDesc}>{item.description}</Text> : null}
                {(item.location || item.assignedTo) && (
                  <View style={s.itemMeta}>
                    {item.location && <Text style={s.itemMetaText}>📍 {item.location}</Text>}
                    {item.assignedTo && <Text style={s.itemMetaText}>👤 {item.assignedTo}</Text>}
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <View style={s.footerLine} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>VivaOps · Confidential</Text>
            <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </View>

      </Page>
    </Document>
  );
}
