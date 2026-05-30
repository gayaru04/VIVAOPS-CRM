import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2", fontWeight: 700 },
  ],
});

const c = {
  purple: "#6d4ed8",
  black: "#111111",
  gray1: "#444444",
  gray2: "#888888",
  gray3: "#cccccc",
  gray4: "#f5f5f7",
  white: "#ffffff",
  green: "#16a34a",
};

const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 10, color: c.black, padding: "48px 52px", backgroundColor: c.white },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBox: { width: 28, height: 28, borderRadius: 6, backgroundColor: c.purple, justifyContent: "center", alignItems: "center" },
  logoText: { color: c.white, fontSize: 13, fontWeight: 700 },
  brandName: { fontSize: 15, fontWeight: 700, color: c.black },
  brandSub: { fontSize: 9, color: c.gray2, marginTop: 1 },
  quoteLabel: { fontSize: 9, fontWeight: 600, color: c.purple, textTransform: "uppercase", letterSpacing: 1.2, textAlign: "right" },
  quoteNumber: { fontSize: 22, fontWeight: 700, color: c.black, textAlign: "right", marginTop: 2 },
  // Meta grid
  metaRow: { flexDirection: "row", gap: 24, marginBottom: 28 },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 8, fontWeight: 600, color: c.gray2, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  metaValue: { fontSize: 10, color: c.black },
  metaValueSm: { fontSize: 9, color: c.gray1, marginTop: 1 },
  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: c.gray3, marginBottom: 20 },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: c.gray4, borderRadius: 4, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 2 },
  tableHeaderText: { fontSize: 8, fontWeight: 600, color: c.gray2, textTransform: "uppercase", letterSpacing: 0.6 },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: c.gray4 },
  tableRowAlt: { backgroundColor: "#fafafa" },
  col1: { flex: 1 },
  col2: { width: 40, textAlign: "right" },
  col3: { width: 70, textAlign: "right" },
  col4: { width: 80, textAlign: "right" },
  cellText: { fontSize: 10, color: c.black },
  cellSub: { fontSize: 8.5, color: c.gray2, marginTop: 1.5 },
  // Totals
  totalsWrap: { alignItems: "flex-end", marginTop: 16 },
  totalRow: { flexDirection: "row", width: 220, justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { fontSize: 9.5, color: c.gray1 },
  totalValue: { fontSize: 9.5, color: c.black, fontWeight: 600 },
  grandRow: { flexDirection: "row", width: 220, justifyContent: "space-between", backgroundColor: c.purple, borderRadius: 6, paddingVertical: 9, paddingHorizontal: 12, marginTop: 6 },
  grandLabel: { fontSize: 11, fontWeight: 700, color: c.white },
  grandValue: { fontSize: 11, fontWeight: 700, color: c.white },
  // Notes
  notesBox: { marginTop: 28, backgroundColor: c.gray4, borderRadius: 6, padding: "12px 14px" },
  notesLabel: { fontSize: 8, fontWeight: 600, color: c.gray2, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 },
  notesText: { fontSize: 9.5, color: c.gray1, lineHeight: 1.5 },
  // Footer
  footer: { position: "absolute", bottom: 36, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: c.gray3 },
  statusBadge: { fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 },
});

function fmt(n: string | number | null | undefined) {
  const num = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  return `$${num.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  draft: c.gray2,
  sent: "#2563eb",
  approved: c.green,
  rejected: "#dc2626",
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
  client: { name: string; email: string | null } | null;
  org: { name: string };
}

export function QuotePdf({ quote, event, client, org }: QuotePdfProps) {
  const items: LineItem[] = Array.isArray(quote.lineItems) ? quote.lineItems : [];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <View style={s.brand}>
              <View style={s.logoBox}><Text style={s.logoText}>V</Text></View>
              <View>
                <Text style={s.brandName}>{org.name}</Text>
                <Text style={s.brandSub}>Event Management</Text>
              </View>
            </View>
          </View>
          <View>
            <Text style={s.quoteLabel}>Quote</Text>
            <Text style={s.quoteNumber}>{quote.number}</Text>
            <Text style={[s.statusBadge, { color: STATUS_COLOR[quote.status] ?? c.gray2, textAlign: "right", marginTop: 4 }]}>
              {quote.status}
            </Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Meta */}
        <View style={s.metaRow}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Bill to</Text>
            <Text style={s.metaValue}>{client?.name ?? "—"}</Text>
            {client?.email && <Text style={s.metaValueSm}>{client.email}</Text>}
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Event</Text>
            <Text style={s.metaValue}>{event.name}</Text>
            {event.eventDate && <Text style={s.metaValueSm}>{fmtDate(event.eventDate)}</Text>}
            {event.venue && <Text style={s.metaValueSm}>{event.venue}</Text>}
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Date issued</Text>
            <Text style={s.metaValue}>{fmtDate(String(quote.createdAt))}</Text>
            {quote.validUntil && (
              <>
                <Text style={[s.metaLabel, { marginTop: 10 }]}>Valid until</Text>
                <Text style={s.metaValue}>{fmtDate(quote.validUntil)}</Text>
              </>
            )}
          </View>
        </View>

        {/* Line items table */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.col1]}>Description</Text>
          <Text style={[s.tableHeaderText, s.col2]}>Qty</Text>
          <Text style={[s.tableHeaderText, s.col3]}>Rate</Text>
          <Text style={[s.tableHeaderText, s.col4]}>Amount</Text>
        </View>

        {items.map((li, i) => (
          <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.cellText, s.col1]}>{li.description}</Text>
            <Text style={[s.cellText, s.col2]}>{li.qty}</Text>
            <Text style={[s.cellText, s.col3]}>{fmt(li.rate)}</Text>
            <Text style={[s.cellText, s.col4]}>{fmt(li.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsWrap}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(quote.subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>GST (10%)</Text>
            <Text style={s.totalValue}>{fmt(quote.tax)}</Text>
          </View>
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>Total</Text>
            <Text style={s.grandValue}>{fmt(quote.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{org.name} · Generated by VivaOps</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
