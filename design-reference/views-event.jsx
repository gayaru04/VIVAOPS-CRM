/* Event detail — the centerpiece */

function ViewEventDetail() {
  const ev = DATA.event;
  const [tab, setTab] = React.useState("overview");

  return (
    <>
      <div className="event-hero">
        <div className="event-hero-grid">
          <div>
            <div className="eyebrow">{ev.code} · {ev.stage}</div>
            <h1 className="serif" style={{ fontFamily: "var(--font-serif)", fontSize: 38, fontWeight: 400, letterSpacing: "-0.02em" }}>
              {ev.title}
            </h1>
            <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>{ev.couple}</div>
            <div className="event-meta">
              <div><I.Calendar /> {ev.date}</div>
              <div><I.Pin2 /> {ev.venue} · <span className="muted">{ev.address}</span></div>
              <div><I.Lead /> {ev.guests} guests</div>
              <div><I.Money /> Budget {fmtMoney(ev.budget)} · spent {fmtMoney(ev.spent)}</div>
              <div><Avatar name={ev.coordinator} hue={252} size={18} /> {ev.coordinator}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            <div className="countdown">
              <div className="num tabular">{ev.countdownDays}</div>
              <div className="label-stack">
                <b>Days to go</b>
                Locked plan · {ev.balance}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn"><I.Print /> Print run sheet</button>
              <button className="btn primary"><I.Open /> Open event day</button>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {ev.tabs.map(t => (
          <button key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.name}
            {t.count != null && <span className="count tabular">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="event-body">
        <div className="event-main">
          {tab === "overview" && <EventOverview ev={ev} />}
          {tab === "tasks" && <EventTasks ev={ev} />}
          {tab === "comms" && <EventComms ev={ev} />}
          {tab === "quotes" && <EventQuotes ev={ev} />}
          {tab === "files" && <EventFiles ev={ev} />}
          {tab === "wo" && <EventWO ev={ev} />}
          {tab === "run" && <EventRun ev={ev} full />}
          {tab === "checklist" && <EventChecklist ev={ev} />}
        </div>
        <div className="event-side">
          <div className="event-side-inner">
            <EventSidePanel ev={ev} />
          </div>
        </div>
      </div>
    </>
  );
}

function EventOverview({ ev }) {
  return (
    <>
      <Card eyebrow="Run sheet · ceremony day" title="Saturday, 14 June" action={<button className="btn sm ghost">Edit <I.Chevron /></button>} noBody>
        <EventRun ev={ev} limit={6} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card eyebrow="Activity" title="Recent events" noBody>
          <div style={{ padding: "12px 16px" }}>
            <div className="timeline">
              {ev.activity.map((a, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-dot" style={{ background: i === 0 ? "var(--accent)" : "var(--text-4)" }}></div>
                  <div>
                    <div className="tl-body"><b>{a.who}</b> {a.what}</div>
                    <div className="tl-time">{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card eyebrow="Comms" title="Latest threads" action={<button className="btn sm ghost">All <I.Chevron /></button>} noBody>
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {ev.comms.slice(0, 3).map((c, i) => (
              <CommItem key={i} c={c} />
            ))}
          </div>
        </Card>
      </div>

      <Card eyebrow="Suppliers" title="Work orders · 7" noBody>
        <table className="table">
          <thead><tr>
            <th>Supplier</th><th>Role</th><th>Status</th><th className="num">Value</th><th></th>
          </tr></thead>
          <tbody>
            {ev.suppliers.map((s, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td className="muted">{s.role}</td>
                <td><StatusBadge status={s.status} /></td>
                <td className="num tabular">{fmtMoney(s.value)}</td>
                <td><I.Chevron /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function EventTasks({ ev }) {
  const items = [
    { t: "Confirm bouquet count w/ Bloom & Vine", who: "Maya",  due: "Tomorrow", p: "High",   done: false },
    { t: "Send v2 quote to couple for review",    who: "Maya",  due: "Today",    p: "Medium", done: true },
    { t: "Final RSVP tally",                      who: "Maya",  due: "Mon",      p: "Low",    done: false },
    { t: "Confirm first-dance cue with DJ",       who: "Ravi",  due: "Wed",      p: "Medium", done: false },
    { t: "Approve printed program",               who: "Jules", due: "Thu",      p: "Medium", done: true },
    { t: "Coach Co. driver list",                 who: "Ravi",  due: "Fri",      p: "High",   done: false },
  ];
  return (
    <Card title="Tasks · 11" eyebrow="11 active · 5 done" noBody action={<button className="btn sm primary"><I.Plus /> New</button>}>
      <div>
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderTop: i ? "1px solid var(--border)" : 0 }}>
            <button className="icon-btn">{t.done ? <I.Check /> : <I.Circle />}</button>
            <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: t.p === "High" ? "var(--st-red)" : t.p === "Medium" ? "var(--st-amber)" : "var(--st-slate)" }}></span>
            <div style={{ flex: 1, opacity: t.done ? 0.55 : 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, textDecoration: t.done ? "line-through" : "none" }}>{t.t}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>{t.who} · <span className="tabular">{t.due}</span></div>
            </div>
            <Badge color={t.p === "High" ? "var(--st-red)" : t.p === "Medium" ? "var(--st-amber)" : "var(--st-slate)"}>{t.p}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CommItem({ c }) {
  return (
    <div className={"comm " + c.kind}>
      <span className="avt" style={{ background: `linear-gradient(135deg, hsl(${c.hue} 70% 55%), hsl(${(c.hue+60)%360} 70% 55%))` }}>
        {c.who.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase()}
      </span>
      <div style={{ minWidth: 0 }}>
        <div className="header">
          <b>{c.who}</b>
          <span>· {c.role}</span>
          {c.kind === "wa" && <span style={{ color: "hsl(150 50% 40%)" }}>· WhatsApp</span>}
          {c.kind === "note" && <span style={{ color: "hsl(36 70% 40%)" }}>· Internal · pinned</span>}
          {c.kind === "email" && <span style={{ color: "hsl(214 80% 45%)" }}>· Email</span>}
          <span style={{ marginLeft: "auto" }}>{c.time}</span>
        </div>
        <div className="bubble">{c.text}</div>
      </div>
    </div>
  );
}

function EventComms({ ev }) {
  return (
    <Card title="Comms" eyebrow="Email · WhatsApp · SMS · internal notes" noBody
      action={<><button className="btn sm"><I.Mail /> Email</button><button className="btn sm primary"><I.Plus /> Note</button></>}>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {ev.comms.map((c, i) => <CommItem key={i} c={c} />)}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--text-3)", fontSize: 12 }}>
            <I.Plus /> <span>Add internal note · message couple · email supplier</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EventQuotes({ ev }) {
  const rows = [
    { v: "v1 · 12 Jan", total: 152000, status: "Superseded", who: "Maya" },
    { v: "v2 · 18 Feb", total: 168000, status: "Accepted",   who: "Maya" },
    { v: "Final invoice", total: 168000, status: "Paid",     who: "Maya" },
  ];
  return (
    <Card title="Quotes · 3" eyebrow="Versioned · audit-logged" noBody action={<button className="btn sm primary"><I.Plus /> New quote</button>}>
      <table className="table">
        <thead><tr><th>Version</th><th className="num">Total</th><th>Status</th><th>Owner</th><th></th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500 }}>{r.v}</td>
              <td className="num tabular">{fmtMoney(r.total)}</td>
              <td><Badge color={r.status === "Accepted" || r.status === "Paid" ? "var(--st-green)" : "var(--st-slate)"}>{r.status}</Badge></td>
              <td>{r.who}</td>
              <td><I.Chevron /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function EventFiles({ ev }) {
  return (
    <Card title="Files · 22" eyebrow="Signed URLs · Supabase Storage" noBody action={<button className="btn sm primary"><I.Plus /> Upload</button>}>
      <table className="table">
        <thead><tr><th>Name</th><th>Size</th><th>Uploaded</th><th></th></tr></thead>
        <tbody>
          {ev.files.map((f, i) => (
            <tr key={i}>
              <td style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <I.Doc style={{ color: "var(--text-3)" }} />
                <span style={{ fontWeight: 500 }}>{f.name}</span>
              </td>
              <td className="muted tabular">{f.size}</td>
              <td className="muted">{f.date}</td>
              <td><I.Open /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function EventWO({ ev }) {
  return (
    <Card title="Work orders · 7" eyebrow="Supplier work orders" noBody action={<button className="btn sm primary"><I.Plus /> Issue WO</button>}>
      <table className="table">
        <thead><tr><th>Supplier</th><th>Role</th><th>Issued</th><th>Status</th><th className="num">Value</th><th></th></tr></thead>
        <tbody>
          {ev.suppliers.map((s, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500 }}>{s.name}</td>
              <td className="muted">{s.role}</td>
              <td className="muted tabular">12 Apr 2026</td>
              <td><StatusBadge status={s.status} /></td>
              <td className="num tabular">{fmtMoney(s.value)}</td>
              <td><I.Chevron /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function EventRun({ ev, limit, full }) {
  const rows = limit ? ev.runsheet.slice(0, limit) : ev.runsheet;
  return (
    <div className="runsheet">
      {rows.map((r, i) => {
        const isNow = r.state === "doing";
        return (
          <div key={i} className={"run-row" + (isNow ? " now" : "")}>
            <div className="time tabular">{r.t}</div>
            <div>
              <div className="title">{r.title}</div>
              <div className="sub">{r.sub}</div>
            </div>
            <div className="who">
              {r.state === "done" && <Badge color="var(--st-green)">Done</Badge>}
              {r.state === "doing" && <Badge color="var(--accent)">In progress</Badge>}
              {r.state === "next" && <span style={{ color: "var(--text-3)", fontSize: 11.5 }}>{r.who}</span>}
            </div>
            <button className="icon-btn"><I.More /></button>
          </div>
        );
      })}
      {limit && (
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>+ {ev.runsheet.length - limit} more entries</span>
          <button className="btn sm ghost">Open full run sheet <I.Chevron /></button>
        </div>
      )}
    </div>
  );
}

function EventChecklist({ ev }) {
  return (
    <Card title="Checklist · 24 items" eyebrow="Wedding template · 5 sections" noBody>
      <div>
        {ev.checklist.map((g, i) => {
          const done = g.items.filter(it => it.done).length;
          return (
            <div key={i} style={{ borderTop: i ? "1px solid var(--border)" : 0 }}>
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-2)" }}>{g.group}</div>
                <div style={{ flex: 1 }}></div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)" }} className="tabular">{done} / {g.items.length}</div>
                <div style={{ width: 60, height: 4, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
                  <div style={{ width: ((done / g.items.length) * 100) + "%", height: "100%", background: done === g.items.length ? "var(--st-green)" : "var(--accent)" }}></div>
                </div>
              </div>
              {g.items.map((it, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px 9px 14px", borderTop: j ? "1px solid var(--border)" : 0 }}>
                  <button className="icon-btn" style={{ color: it.done ? "var(--st-green)" : "var(--text-3)" }}>
                    {it.done ? <I.Check /> : <I.Circle />}
                  </button>
                  <span style={{ fontSize: 13, color: it.done ? "var(--text-3)" : "var(--text)", textDecoration: it.done ? "line-through" : "none" }}>{it.t}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EventSidePanel({ ev }) {
  return (
    <>
      <Card eyebrow="Snapshot" title="Event facts" noBody>
        <div style={{ padding: "4px 14px 12px" }}>
          <div className="field"><div className="k">Code</div><div className="v mono">{ev.code}</div></div>
          <div className="field"><div className="k">Stage</div><div className="v"><StatusBadge status={ev.stage} /></div></div>
          <div className="field"><div className="k">Date</div><div className="v">{ev.date}</div></div>
          <div className="field"><div className="k">Guests</div><div className="v tabular">{ev.guests}</div></div>
          <div className="field"><div className="k">Venue</div><div className="v">{ev.venue}</div></div>
          <div className="field"><div className="k">Budget</div><div className="v tabular">{fmtMoney(ev.budget)}</div></div>
          <div className="field"><div className="k">Spent</div><div className="v tabular">{fmtMoney(ev.spent)}</div></div>
          <div className="field"><div className="k">Deposit</div><div className="v">{ev.deposit}</div></div>
          <div className="field"><div className="k">Balance</div><div className="v">{ev.balance}</div></div>
          <div className="field"><div className="k">Coordinator</div><div className="v"><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Avatar name={ev.coordinator} hue={252} size={18} />{ev.coordinator}</span></div></div>
        </div>
      </Card>

      <Card eyebrow="Pinned" title="Important notes" noBody>
        <div style={{ padding: "12px 14px" }}>
          <div className="comm note" style={{ display: "block" }}>
            <div className="bubble" style={{ maxWidth: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, marginBottom: 6, fontWeight: 600, color: "hsl(36 65% 35%)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <I.Pin style={{ width: 11, height: 11 }} /> Run-sheet flag
              </div>
              Aunt Vivian must be present at the cake cut. Couple was firm on this — AV cued to wait for her arrival from terrace.
            </div>
          </div>
        </div>
      </Card>

      <Card eyebrow="Cash" title="Money flow" noBody>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }} className="tabular">{fmtMoney(ev.spent)}</div>
            <div className="muted" style={{ fontSize: 12 }}>of {fmtMoney(ev.budget)}</div>
          </div>
          <div style={{ marginTop: 10, height: 8, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: ((ev.spent / ev.budget) * 100) + "%", height: "100%", background: "var(--accent)" }}></div>
          </div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--text-3)" }}>74% committed · balance settlement {ev.balance}</div>
        </div>
      </Card>
    </>
  );
}

Object.assign(window, { ViewEventDetail });
