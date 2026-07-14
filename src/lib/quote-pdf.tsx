import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const purple = "#6d4ed8";
const black = "#111111";
const gray1 = "#444444";
const gray2 = "#888888";
const gray3 = "#d4d4d4";
// gray4 reserved for future use
const white = "#ffffff";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: black,
    paddingTop: 52,
    paddingBottom: 72,
    paddingHorizontal: 52,
    backgroundColor: white,
  },

  // ── Header ────────────────────────────────────────────────
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  heading: { fontFamily: "Helvetica-Bold", fontSize: 36, color: black, letterSpacing: -0.5 },
  quoteNum: { fontSize: 10, color: gray2, marginTop: 5 },
  logoBox: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: purple,
    justifyContent: "center", alignItems: "center",
  },
  logoText: { fontFamily: "Helvetica-Bold", fontSize: 18, color: white },

  // ── Divider ───────────────────────────────────────────────
  divider: { borderBottomWidth: 1, borderBottomColor: gray3, marginBottom: 20 },
  dividerThin: { borderBottomWidth: 0.5, borderBottomColor: gray3, marginVertical: 6 },

  // ── Meta grid (3 cols) ────────────────────────────────────
  metaGrid: { flexDirection: "row", marginBottom: 32 },
  metaCol: { flex: 1, paddingRight: 16 },
  metaColBorder: { flex: 1, paddingHorizontal: 16, borderLeftWidth: 1, borderLeftColor: gray3 },
  metaKey: { fontFamily: "Helvetica-Bold", fontSize: 9, color: black, marginBottom: 4 },
  metaVal: { fontSize: 9, color: gray1, lineHeight: 1.5 },
  metaValBold: { fontFamily: "Helvetica-Bold", fontSize: 9, color: black, lineHeight: 1.5 },

  // ── Table ─────────────────────────────────────────────────
  tableHead: { flexDirection: "row", paddingBottom: 8 },
  tableHeadText: { fontFamily: "Helvetica-Bold", fontSize: 9, color: black },
  tableRow: { flexDirection: "row", paddingVertical: 10 },
  colService: { flex: 1 },
  colQty: { width: 44, textAlign: "right" },
  colRate: { width: 72, textAlign: "right" },
  colAmount: { width: 80, textAlign: "right" },
  cellBold: { fontFamily: "Helvetica-Bold", fontSize: 10, color: black },
  cellSub: { fontSize: 8.5, color: gray2, marginTop: 2 },
  cellNum: { fontSize: 10, color: gray1 },

  // ── Totals ────────────────────────────────────────────────
  totalsOuter: { alignItems: "flex-end", marginTop: 8, marginBottom: 28 },
  totalsBox: { width: 260 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalKey: { fontSize: 9.5, color: gray1 },
  totalVal: { fontSize: 9.5, color: black },
  totalKeyBold: { fontFamily: "Helvetica-Bold", fontSize: 10, color: black },
  totalValBold: { fontFamily: "Helvetica-Bold", fontSize: 10, color: black },
  amountDueKey: { fontFamily: "Helvetica-Bold", fontSize: 11, color: purple },
  amountDueVal: { fontFamily: "Helvetica-Bold", fontSize: 11, color: purple },
  accentLine: { borderBottomWidth: 1.5, borderBottomColor: purple, marginTop: 4 },

  // ── Thank you ─────────────────────────────────────────────
  thankBox: { marginTop: 8 },
  thankTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: black, marginBottom: 3 },
  thankNote: { fontSize: 9, color: gray2 },

  // ── Footer ────────────────────────────────────────────────
  footer: { position: "absolute", bottom: 32, left: 52, right: 52 },
  footerDivider: { borderTopWidth: 0.5, borderTopColor: gray3, marginBottom: 8 },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: gray2 },
});

function fmt(n: string | number | null | undefined) {
  const num = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  return `$${num.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric", timeZone: "Australia/Melbourne" });
}

const STATUS_COLOR: Record<string, string> = {
  draft: gray2, sent: "#2563eb", approved: "#16a34a", rejected: "#dc2626",
};

interface LineItem { description: string; qty: number; rate: number; amount: number }

interface QuotePdfProps {
  quote: {
    number: string;
    status: string;
    subtotal: string;
    tax: string;
    total: string;
    validUntil: string | null;
    notes: string | null;
    lineItems: LineItem[];
    createdAt: Date | string;
  };
  event: { name: string; eventDate: string | null; venue: string | null };
  client: { name: string; email: string | null; phone?: string | null } | null;
  org: { name: string };
}

export function QuotePdf({ quote, event, client, org }: QuotePdfProps) {
  const items: LineItem[] = Array.isArray(quote.lineItems) ? quote.lineItems : [];

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.heading}>QUOTE</Text>
            <Text style={s.quoteNum}>#{quote.number}</Text>
          </View>
          <View style={s.logoBox}>
            <Text style={s.logoText}>V</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Meta: 3 columns */}
        <View style={s.metaGrid}>
          {/* Col 1 — dates */}
          <View style={s.metaCol}>
            <Text style={s.metaKey}>Issued</Text>
            <Text style={s.metaVal}>{fmtDate(String(quote.createdAt))}</Text>
            {quote.validUntil && (
              <>
                <Text style={[s.metaKey, { marginTop: 12 }]}>Valid until</Text>
                <Text style={s.metaVal}>{fmtDate(quote.validUntil)}</Text>
              </>
            )}
            <Text style={[s.metaKey, { marginTop: 12 }]}>Status</Text>
            <Text style={[s.metaVal, { color: STATUS_COLOR[quote.status] ?? gray2 }]}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Text>
          </View>

          {/* Col 2 — billed to */}
          <View style={s.metaColBorder}>
            <Text style={s.metaKey}>Billed to</Text>
            <Text style={s.metaValBold}>{client?.name ?? "—"}</Text>
            {client?.email && <Text style={s.metaVal}>{client.email}</Text>}
            {client?.phone && <Text style={s.metaVal}>{client.phone}</Text>}
          </View>

          {/* Col 3 — event / from */}
          <View style={s.metaColBorder}>
            <Text style={s.metaKey}>From</Text>
            <Text style={s.metaValBold}>{org.name}</Text>
            <Text style={[s.metaKey, { marginTop: 12 }]}>Event</Text>
            <Text style={s.metaVal}>{event.name}</Text>
            {event.eventDate && <Text style={s.metaVal}>{fmtDate(event.eventDate)}</Text>}
            {event.venue && <Text style={s.metaVal}>{event.venue}</Text>}
          </View>
        </View>

        <View style={s.divider} />

        {/* Table header */}
        <View style={s.tableHead}>
          <Text style={[s.tableHeadText, s.colService]}>Service</Text>
          <Text style={[s.tableHeadText, s.colQty]}>Qty</Text>
          <Text style={[s.tableHeadText, s.colRate]}>Rate</Text>
          <Text style={[s.tableHeadText, s.colAmount]}>Line total</Text>
        </View>
        <View style={s.dividerThin} />

        {/* Line items */}
        {items.map((li, i) => (
          <View key={i}>
            <View style={s.tableRow}>
              <View style={s.colService}>
                <Text style={s.cellBold}>{li.description}</Text>
              </View>
              <Text style={[s.cellNum, s.colQty]}>{li.qty}</Text>
              <Text style={[s.cellNum, s.colRate]}>{fmt(li.rate)}</Text>
              <Text style={[s.cellNum, s.colAmount]}>{fmt(li.amount)}</Text>
            </View>
            <View style={s.dividerThin} />
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsOuter}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalKey}>Subtotal</Text>
              <Text style={s.totalVal}>{fmt(quote.subtotal)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalKey}>Tax (GST 10%)</Text>
              <Text style={s.totalVal}>{fmt(quote.tax)}</Text>
            </View>
            <View style={[s.totalRow, { marginTop: 2 }]}>
              <Text style={s.totalKeyBold}>Total</Text>
              <Text style={s.totalValBold}>{fmt(quote.total)}</Text>
            </View>
            <View style={s.dividerThin} />
            <View style={[s.totalRow, { marginTop: 4 }]}>
              <Text style={s.amountDueKey}>Amount due</Text>
              <Text style={s.amountDueVal}>AUD {fmt(quote.total)}</Text>
            </View>
            <View style={s.accentLine} />
          </View>
        </View>

        {/* Notes / thank you */}
        <View style={s.thankBox}>
          <Text style={s.thankTitle}>Thank you for choosing {org.name}!</Text>
          {quote.notes
            ? <Text style={s.thankNote}>{quote.notes}</Text>
            : <Text style={s.thankNote}>Please pay within 14 days of receiving this quote.</Text>
          }
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <View style={s.footerDivider} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>{org.name} · Event Management</Text>
            <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </View>

      </Page>
    </Document>
  );
}
