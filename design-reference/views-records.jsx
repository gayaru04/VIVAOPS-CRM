/* Records: Leads / Clients / Events list / Tasks */

function FilterBar({ chips = [] }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "10px 28px", borderBottom: "1px solid var(--border)", background: "var(--bg)", alignItems: "center", flexWrap: "wrap" }}>
      <div className="cmd" style={{ minWidth: 240, marginLeft: 0 }}>
        <I.Search />
        <span>Search records…</span>
      </div>
      {chips.map((c, i) => (
        <button key={i} className="btn sm">{c}</button>
      ))}
      <button className="btn sm ghost"><I.Plus /> Add filter</button>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button className="btn sm"><I.Sort /> Sort</button>
        <button className="btn sm"><I.More /></button>
      </div>
    </div>
  );
}

function ViewLeads({ setRoute }) {
  const d = DATA.leads;
  return (
    <>
      <PageHead
        eyebrow="Records · 28 leads"
        title="Leads"
        sub="Inbound and outbound. New website inquiries auto-create here."
        actions={
          <>
            <button className="btn"><I.Mail /> Inquiry endpoint</button>
            <button className="btn primary"><I.Plus /> New lead</button>
          </>
        }
      />
      <FilterBar chips={["Stage: any", "Owner: Maya", "Source: any", "Updated: 30d"]} />
      <div style={{ padding: "0 28px 60px" }}>
        <table className="table" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginTop: 14 }}>
          <thead><tr>
            <th style={{ width: 26 }}></th>
            <th>Name</th>
            <th>Type</th>
            <th>Source</th>
            <th>Stage</th>
            <th className="num">Value</th>
            <th>Owner</th>
            <th>Next action</th>
            <th className="num">Updated</th>
            <th style={{ width: 28 }}></th>
          </tr></thead>
          <tbody>
            {d.map(l => (
              <tr key={l.id} onClick={() => l.name === "Hartley Wedding" && setRoute("event")} style={{ cursor: l.name === "Hartley Wedding" ? "pointer" : "default" }}>
                <td><Avatar name={l.name} hue={(l.id.charCodeAt(3) * 23) % 360} size={22} /></td>
                <td>
                  <div style={{ fontWeight: 500 }}>{l.name}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{l.company}</div>
                </td>
                <td><Badge color="var(--st-violet)">{l.type}</Badge></td>
                <td className="muted">{l.source}</td>
                <td><StatusBadge status={l.stage} /></td>
                <td className="num">{fmtMoney(l.value)}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar name={l.owner} hue={140} size={18} />
                    <span>{l.owner}</span>
                  </div>
                </td>
                <td className="muted">{l.next}</td>
                <td className="num muted">{l.updated}</td>
                <td><I.Chevron /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ViewClients() {
  const rows = [
    { name: "Hartley Family",  type: "Private", events: 1, since: "2026", lifetime: 168000, contact: "Sophie Hartley" },
    { name: "Atlas Capital",   type: "Corporate", events: 4, since: "2023", lifetime: 412000, contact: "Helena Voss" },
    { name: "MCG Foundation",  type: "Non-profit", events: 2, since: "2022", lifetime: 298000, contact: "Daniel Okafor" },
    { name: "Bennett Family",  type: "Private", events: 1, since: "2026", lifetime: 78000, contact: "Olivia Bennett" },
    { name: "Sharma–Patel",    type: "Private", events: 2, since: "2025", lifetime: 174000, contact: "Priya Sharma" },
    { name: "Northbank Co.",   type: "Corporate", events: 3, since: "2024", lifetime: 192000, contact: "Tom Hardacre" },
    { name: "Park Private",    type: "Private", events: 1, since: "2026", lifetime: 22000, contact: "Lina Park" },
    { name: "Whitfield Retreats", type: "Corporate", events: 2, since: "2024", lifetime: 156000, contact: "Greg Whitfield" },
  ];
  return (
    <>
      <PageHead eyebrow="Records · 142 clients" title="Clients" sub="Households and companies with at least one closed event" />
      <FilterBar chips={["Type: any", "Lifetime: any", "Last event: 12 months"]} />
      <div style={{ padding: "0 28px 60px" }}>
        <table className="table" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginTop: 14 }}>
          <thead><tr>
            <th>Client</th><th>Type</th><th>Primary contact</th><th className="num">Events</th><th>Since</th><th className="num">Lifetime value</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                  <Avatar name={r.name} hue={(r.name.charCodeAt(0) * 11) % 360} size={22} />
                  {r.name}
                </td>
                <td><Badge color={r.type === "Private" ? "var(--st-pink)" : r.type === "Corporate" ? "var(--st-blue)" : "var(--st-violet)"}>{r.type}</Badge></td>
                <td className="muted">{r.contact}</td>
                <td className="num tabular">{r.events}</td>
                <td className="muted tabular">{r.since}</td>
                <td className="num tabular">{fmtMoney(r.lifetime)}</td>
                <td><I.Chevron /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ViewEvents({ setRoute }) {
  const rows = [
    { name: "Hartley Wedding",     date: "Sat 14 Jun", guests: 142, venue: "Brighton Beach Pavilion", coord: "Maya",  budget: 168000, stage: "Confirmed", route: "event" },
    { name: "Atlas Capital · EOFY",date: "Thu 26 Jun", guests: 240, venue: "Crown Pearl Room",         coord: "Jules", budget: 124000, stage: "Proposal sent" },
    { name: "Sharma–Patel Sangeet",date: "Fri 11 Jul", guests: 180, venue: "Royal Exhibition Building",coord: "Maya",  budget: 92000,  stage: "Catering open" },
    { name: "MCG Foundation Gala", date: "Sat 02 Aug", guests: 320, venue: "MCG Olympic Room",          coord: "Ravi",  budget: 158000, stage: "Walk-through" },
    { name: "Park Birthday · 40th",date: "Sun 17 Aug", guests: 50,  venue: "Half Acre Riverside",       coord: "Jules", budget: 22000,  stage: "Deposit due" },
    { name: "Whitfield Retreat",   date: "Fri 12 Sep", guests: 60,  venue: "Hilltop Vineyards",         coord: "Maya",  budget: 88000,  stage: "Confirmed" },
    { name: "Hilltop EOY",         date: "Sat 06 Dec", guests: 130, venue: "Hilltop Vineyards",         coord: "Ravi",  budget: 56000,  stage: "Proposal sent" },
  ];
  return (
    <>
      <PageHead eyebrow="Delivery · 19 events" title="Events" sub="Pipeline → delivery. Click an event to open the centerpiece."
        actions={<><button className="btn"><I.Calendar /> Calendar view</button><button className="btn primary"><I.Plus /> New event</button></>}
      />
      <FilterBar chips={["Stage: any", "Coordinator: any", "Date: next 90d"]} />
      <div style={{ padding: "0 28px 60px" }}>
        <table className="table" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginTop: 14 }}>
          <thead><tr>
            <th>Event</th><th>Date</th><th className="num">Guests</th><th>Venue</th><th>Coordinator</th><th className="num">Budget</th><th>Stage</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onClick={() => r.route && setRoute(r.route)} style={{ cursor: r.route ? "pointer" : "default" }}>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td className="tabular">{r.date}</td>
                <td className="num tabular">{r.guests}</td>
                <td className="muted">{r.venue}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar name={r.coord} hue={140} size={18} /> {r.coord}
                  </div>
                </td>
                <td className="num tabular">{fmtMoney(r.budget)}</td>
                <td><StatusBadge status={r.stage} /></td>
                <td><I.Chevron /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ViewTasks() {
  const groups = [
    { title: "Overdue (4)",  items: DATA.tasks.slice(0, 1).map(t => ({ ...t, due: "Yesterday", overdue: true })) },
    { title: "Today (3)",    items: DATA.tasks.slice(1, 3) },
    { title: "This week (8)",items: DATA.tasks.slice(3, 5) },
  ];
  return (
    <>
      <PageHead eyebrow="Workspace" title="Tasks" sub="Across every event you coordinate"
        actions={<button className="btn primary"><I.Plus /> New task</button>}
      />
      <div style={{ padding: "20px 28px 60px", display: "flex", flexDirection: "column", gap: 18 }}>
        {groups.map(g => (
          <Card key={g.title} title={g.title} noBody>
            <div style={{ padding: "0 4px" }}>
              {g.items.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderTop: i ? "1px solid var(--border)" : 0 }}>
                  <button className="icon-btn"><I.Circle /></button>
                  <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: t.priority === "High" ? "var(--st-red)" : t.priority === "Medium" ? "var(--st-amber)" : "var(--st-slate)" }}></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t.t}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                      <span style={{ color: "var(--accent)" }}>{t.tag}</span> · {t.who} · <span className="tabular">{t.due}</span>
                    </div>
                  </div>
                  <Badge color={t.overdue ? "var(--st-red)" : "var(--st-slate)"}>{t.priority}</Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

Object.assign(window, { ViewLeads, ViewClients, ViewEvents, ViewTasks });
