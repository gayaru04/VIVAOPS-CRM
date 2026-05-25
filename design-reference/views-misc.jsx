/* Misc views: Calendar, Suppliers, Work Orders, Checklists, Event Day, Ops, Audit, Settings */

function ViewCalendar() {
  // Mini month view, June 2026
  const events = {
    14: [{ name: "Hartley Wedding", color: "var(--accent)" }],
    26: [{ name: "Atlas EOFY", color: "var(--st-blue)" }],
    11: [{ name: "Sangeet", color: "var(--st-pink)" }],
    2:  [{ name: "Internal: ops review", color: "var(--st-slate)" }],
    18: [{ name: "Site walk · MCG", color: "var(--st-violet)" }],
  };
  const start = 1; // Mon = 1 Jun
  const days = 30;
  const headers = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <>
      <PageHead eyebrow="Delivery" title="Calendar · June 2026"
        actions={<><button className="btn">Month</button><button className="btn">Week</button><button className="btn primary"><I.Plus /> New event</button></>}
      />
      <div style={{ padding: "20px 28px 60px" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
            {headers.map(h => (
              <div key={h} style={{ padding: "8px 10px", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{h}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {Array.from({ length: days + (start - 1) }).map((_, i) => {
              const day = i - (start - 1) + 1;
              const valid = day >= 1 && day <= days;
              const evs = valid ? events[day] || [] : [];
              const isToday = day === 26;
              return (
                <div key={i} style={{
                  minHeight: 96,
                  padding: 8,
                  borderRight: ((i + 1) % 7 !== 0) ? "1px solid var(--border)" : 0,
                  borderBottom: "1px solid var(--border)",
                  background: isToday ? "var(--accent-soft)" : "transparent",
                  opacity: valid ? 1 : 0.3,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: isToday ? "var(--accent)" : "var(--text-2)", marginBottom: 6 }} className="tabular">
                    {valid ? day : ""}
                  </div>
                  {evs.map((e, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "3px 6px", marginBottom: 4,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      fontSize: 11.5,
                    }}>
                      <span className="dot" style={{ width: 5, height: 5, borderRadius: "50%", background: e.color }}></span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function ViewSuppliers() {
  const rows = [
    { name: "Bloom & Vine",    role: "Florals",     rating: 4.9, jobs: 18, last: "Hartley · Floral install",   contact: "Anu Williams" },
    { name: "Pearl Catering",  role: "Catering",    rating: 4.8, jobs: 32, last: "Atlas · Tasting",            contact: "Tom Pearl" },
    { name: "Soundtrip",       role: "AV + DJ",     rating: 4.7, jobs: 24, last: "Hartley · run-through",      contact: "Reggie Lo" },
    { name: "Mei Photography", role: "Photo + video", rating: 5.0, jobs: 12, last: "Hartley · brief signed",   contact: "Mei Hashimoto" },
    { name: "Coach Co.",       role: "Transport",   rating: 4.5, jobs: 9,  last: "Hartley WO issued",          contact: "Greg Tan" },
    { name: "Sweet Bake Co.",  role: "Cake",        rating: 4.9, jobs: 21, last: "Hartley · tasting done",     contact: "Penny Sweet" },
    { name: "Beach Pavilion",  role: "Venue",       rating: 4.6, jobs: 7,  last: "Hartley · COI received",     contact: "Marina Reid" },
    { name: "Half Acre",       role: "Venue",       rating: 4.7, jobs: 11, last: "Park birthday hold",         contact: "Jim Halverson" },
  ];
  return (
    <>
      <PageHead eyebrow="Delivery · 47 suppliers" title="Suppliers" sub="Trusted Melbourne network"
        actions={<button className="btn primary"><I.Plus /> Add supplier</button>}
      />
      <FilterBar chips={["Role: any", "Region: Melbourne", "Rating: 4+"]} />
      <div style={{ padding: "0 28px 60px" }}>
        <table className="table" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginTop: 14 }}>
          <thead><tr><th>Supplier</th><th>Role</th><th>Primary contact</th><th className="num">Rating</th><th className="num">Jobs</th><th>Last activity</th><th></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                  <Avatar name={r.name} hue={(r.name.charCodeAt(0) * 13) % 360} size={22} />
                  {r.name}
                </td>
                <td><Badge color="var(--st-violet)">{r.role}</Badge></td>
                <td className="muted">{r.contact}</td>
                <td className="num tabular">{r.rating}</td>
                <td className="num tabular">{r.jobs}</td>
                <td className="muted">{r.last}</td>
                <td><I.Chevron /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ViewWO() {
  const rows = [
    { id: "WO-244", event: "Hartley Wedding", supplier: "Bloom & Vine",   role: "Florals",     issued: "12 Apr", status: "Confirmed", value: 18500 },
    { id: "WO-243", event: "Hartley Wedding", supplier: "Pearl Catering", role: "Catering",    issued: "14 Apr", status: "Confirmed", value: 42800 },
    { id: "WO-242", event: "Hartley Wedding", supplier: "Coach Co.",      role: "Transport",   issued: "16 May", status: "Pending",   value: 2200  },
    { id: "WO-241", event: "Atlas EOFY",      supplier: "Pearl Catering", role: "Catering",    issued: "20 May", status: "Pending",   value: 38000 },
    { id: "WO-240", event: "Sharma–Patel",    supplier: "Soundtrip",      role: "AV + DJ",     issued: "12 May", status: "Confirmed", value: 11400 },
  ];
  return (
    <>
      <PageHead eyebrow="Delivery · 12 work orders" title="Work orders"
        actions={<button className="btn primary"><I.Plus /> Issue work order</button>}
      />
      <FilterBar chips={["Event: any", "Status: any", "Supplier: any"]} />
      <div style={{ padding: "0 28px 60px" }}>
        <table className="table" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginTop: 14 }}>
          <thead><tr><th>ID</th><th>Event</th><th>Supplier</th><th>Role</th><th>Issued</th><th>Status</th><th className="num">Value</th><th></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{r.id}</td>
                <td style={{ fontWeight: 500 }}>{r.event}</td>
                <td>{r.supplier}</td>
                <td className="muted">{r.role}</td>
                <td className="muted tabular">{r.issued}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="num tabular">{fmtMoney(r.value)}</td>
                <td><I.Chevron /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ViewChecklists() {
  const templates = [
    { name: "Wedding · Full service",  items: 24, used: 11, last: "Hartley Wedding" },
    { name: "Corporate · Gala",        items: 31, used: 6,  last: "Atlas EOFY" },
    { name: "Private · Birthday",      items: 14, used: 9,  last: "Park birthday" },
    { name: "Non-profit · Fundraiser", items: 22, used: 4,  last: "MCG Foundation" },
    { name: "Brand activation",        items: 19, used: 7,  last: "Yara Studios launch" },
  ];
  return (
    <>
      <PageHead eyebrow="Delivery · Templates" title="Checklists" sub="Reusable templates applied at event creation"
        actions={<button className="btn primary"><I.Plus /> New template</button>}
      />
      <div style={{ padding: "20px 28px 60px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {templates.map((t, i) => (
          <Card key={i} eyebrow={t.items + " items"} title={t.name} noBody>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Used by {t.used} events · last: {t.last}</div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="btn sm">Open</button>
                <button className="btn sm ghost">Duplicate</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function ViewEventDay() {
  const t = DATA.today;
  const ev = DATA.event;
  return (
    <>
      <PageHead eyebrow="Today · Sat 14 Jun" title={t.eventTitle}
        sub="Live readiness. Tap a tile to drill in."
        actions={<>
          <button className="btn"><I.Print /> Print run sheet</button>
          <button className="btn primary"><I.Open /> Open event detail</button>
        </>}
      />
      <div style={{ padding: "20px 28px 60px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="tile-grid">
          {t.tiles.map((tile, i) => (
            <div key={i} className={"tile xhair " + (tile.state || "")}>
              <div className="label">{tile.label}</div>
              <div className="big">{tile.value}</div>
              <div className="small">{tile.sub}</div>
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <span className="dot" style={{
                  width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                  background: tile.state === "ok" ? "var(--st-green)" : tile.state === "warn" ? "var(--st-amber)" : "var(--st-red)",
                }}></span>
              </div>
            </div>
          ))}
        </div>

        <div className="split">
          <Card eyebrow="Schedule" title="Today's run · live" action={<button className="btn sm ghost">Full sheet <I.Chevron /></button>} noBody>
            <EventRun ev={ev} limit={7} />
          </Card>
          <Card eyebrow="Suppliers" title="Confirmation status" noBody>
            <table className="table">
              <thead><tr><th>Supplier</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {ev.suppliers.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td className="muted">{s.role}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
}

function ViewOps() {
  const events = DATA.recentEvents.concat([
    { name: "Hilltop EOY",      when: "Sat 06 Dec", venue: "Hilltop Vineyards",  status: "Proposal sent", health: "warn" },
    { name: "Whitfield Retreat",when: "Fri 12 Sep", venue: "Hilltop Vineyards",  status: "Confirmed",     health: "ok" },
  ]);
  return (
    <>
      <PageHead eyebrow="Ops · Next 14 days" title="Operations dashboard"
        sub="Manager view. Anything red lands here within 24h."
      />
      <div style={{ padding: "20px 28px 60px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="kpi-row">
          <div className="card xhair kpi"><div className="kpi-label">Events in 14d</div><div className="kpi-value">5</div><div className="kpi-delta">2 inside 7d</div></div>
          <div className="card xhair kpi"><div className="kpi-label">Supplier confirms</div><div className="kpi-value">93%</div><div className="kpi-delta up">+4pts wk/wk</div></div>
          <div className="card xhair kpi"><div className="kpi-label">Outstanding cash</div><div className="kpi-value">$48k</div><div className="kpi-delta">2 invoices</div></div>
          <div className="card xhair kpi"><div className="kpi-label">Red flags</div><div className="kpi-value">2</div><div className="kpi-delta down">Park deposit · Coach Co.</div></div>
        </div>

        <Card eyebrow="Next 14 days" title="Events at a glance" noBody>
          <table className="table">
            <thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Status</th><th>Health</th></tr></thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{e.name}</td>
                  <td className="tabular">{e.when}</td>
                  <td className="muted">{e.venue}</td>
                  <td><StatusBadge status={e.status} /></td>
                  <td>
                    <span className="dot" style={{
                      width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                      background: e.health === "ok" ? "var(--st-green)" : e.health === "warn" ? "var(--st-amber)" : "var(--st-red)",
                    }}></span>
                    <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text-2)" }}>
                      {e.health === "ok" ? "On track" : e.health === "warn" ? "Watching" : "At risk"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

function ViewAudit() {
  return (
    <>
      <PageHead eyebrow="Admin · Compliance" title="Audit log"
        sub="Every mutating server action records actor, action, entity, summary."
        actions={<button className="btn"><I.Open /> Export CSV</button>}
      />
      <div style={{ padding: "20px 28px 60px" }}>
        <FilterBar chips={["Actor: any", "Entity: any", "Verb: any", "Last 30d"]} />
        <div className="card" style={{ marginTop: 14, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "130px 100px 1fr 110px", gap: 12, background: "var(--surface-2)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>
            <div>Actor</div><div>Action</div><div>Summary</div><div style={{ textAlign: "right" }}>When</div>
          </div>
          {DATA.audit.map((r, i) => (
            <div key={i} className="audit-row">
              <div className="who">
                <Avatar name={r.who === "system" ? "S Y" : r.who} hue={r.who === "system" ? 220 : (r.who.charCodeAt(0) * 23) % 360} size={20} />
                <span style={{ fontSize: 12.5 }}>{r.who}</span>
              </div>
              <div className="act">{r.act}</div>
              <div className="sum">{r.sum}</div>
              <div className="time">{r.when}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ViewSettings() {
  return (
    <>
      <PageHead eyebrow="Admin" title="Settings"
        sub="Workspace, members, integrations, branding"
      />
      <div style={{ padding: "20px 28px 60px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {["Workspace","Members & roles","Integrations","Branding","Billing","Inquiry endpoint","Data & audit"].map((s, i) => (
            <div key={s} className={"nav-item" + (i === 1 ? " active" : "")} style={{ marginLeft: 0 }}>{s}</div>
          ))}
        </div>
        <div>
          <Card eyebrow="Members" title="People with workspace access · 8" noBody>
            <table className="table">
              <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Last active</th><th></th></tr></thead>
              <tbody>
                {[
                  { n: "Maya Chen",   r: "Manager", e: "maya@vivamelb.co",   l: "now" },
                  { n: "Jules Park",  r: "Coordinator", e: "jules@vivamelb.co", l: "12m" },
                  { n: "Ravi Singh",  r: "Coordinator", e: "ravi@vivamelb.co",  l: "1h" },
                  { n: "Helena Voss", r: "Sales", e: "helena@vivamelb.co",  l: "yesterday" },
                  { n: "Tom Hardy",   r: "Read-only", e: "tom@vivamelb.co",   l: "3 days" },
                ].map((p, i) => (
                  <tr key={i}>
                    <td style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                      <Avatar name={p.n} hue={(p.n.charCodeAt(0) * 17) % 360} size={22} /> {p.n}
                    </td>
                    <td><Badge color={p.r === "Manager" ? "var(--accent)" : "var(--st-slate)"}>{p.r}</Badge></td>
                    <td className="muted">{p.e}</td>
                    <td className="muted">{p.l}</td>
                    <td><I.More /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ViewCalendar, ViewSuppliers, ViewWO, ViewChecklists, ViewEventDay, ViewOps, ViewAudit, ViewSettings });
