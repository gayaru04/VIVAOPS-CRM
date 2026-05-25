/* Dashboard */

function ViewDashboard({ setRoute }) {
  const d = DATA;
  const totalPipe = d.pipeline.reduce((s, p) => s + p.value, 0);
  return (
    <>
      <PageHead
        eyebrow="Workspace · Today"
        title="Good afternoon, Maya"
        sub="Tuesday, 26 May 2026 · 9 leads need attention, 2 events inside 7 days"
        actions={
          <>
            <button className="btn"><I.Filter /> Filter</button>
            <button className="btn primary"><I.Plus /> New lead</button>
          </>
        }
      />
      <div style={{ padding: "20px 28px 60px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* KPI rail */}
        <div className="kpi-row">
          {d.kpis.map((k, i) => (
            <div key={i} className="card xhair kpi">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className={"kpi-delta " + (k.up ? "up" : "down")}>
                {k.up ? <I.ArrowUp /> : <I.ArrowDown />}
                {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline + Recent leads */}
        <div className="split">
          <Card
            eyebrow="Sales"
            title="Pipeline by stage"
            action={<button className="btn sm ghost" onClick={() => setRoute("pipeline")}>Open pipeline <I.Chevron /></button>}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em" }} className="tabular">
                {fmtMoney(totalPipe)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>across {d.pipeline.reduce((s, p) => s + p.count, 0)} active deals</div>
            </div>
            <div className="funnel">
              {d.pipeline.map((p, i) => (
                <div key={i} className="funnel-seg" style={{ flex: p.count }} title={`${p.stage}: ${p.count}`} />
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              {d.pipeline.map(p => {
                const pct = (p.value / Math.max(...d.pipeline.map(x => x.value))) * 100;
                return (
                  <div key={p.stage} className="pipe-row">
                    <div className="label" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span className="dot" style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, display: "inline-block" }}></span>
                      {p.stage}
                    </div>
                    <div className="count">{p.count}</div>
                    <div className="bar"><div className="fill" style={{ width: pct + "%", background: p.color }}></div></div>
                    <div className="meta">{fmtMoney(p.value)}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            eyebrow="Pipeline"
            title="Needs attention"
            action={<button className="btn sm ghost"><I.More /></button>}
            noBody
          >
            <div style={{ padding: "4px 14px 12px" }}>
              {d.leads.slice(0, 5).map(l => (
                <div key={l.id} style={{ padding: "9px 0", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={l.name} hue={(l.id.charCodeAt(3) * 17) % 360} size={24} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{l.next}</div>
                  </div>
                  <StatusBadge status={l.stage} />
                </div>
              ))}
              <div style={{ paddingTop: 10 }}>
                <a onClick={() => setRoute("leads")} style={{ cursor: "pointer", fontSize: 12.5 }}>View all leads →</a>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming events + Tasks */}
        <div className="split">
          <Card eyebrow="Delivery" title="Upcoming events" action={<button className="btn sm ghost" onClick={() => setRoute("events")}>All events <I.Chevron /></button>} noBody>
            <table className="table">
              <thead><tr>
                <th>Event</th><th>Date</th><th>Venue</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {d.recentEvents.map((e, i) => (
                  <tr key={i} onClick={() => i === 0 && setRoute("event")} style={{ cursor: i === 0 ? "pointer" : "default" }}>
                    <td style={{ fontWeight: 500 }}>{e.name}</td>
                    <td className="tabular">{e.when}</td>
                    <td className="muted">{e.venue}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td><I.Chevron /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card eyebrow="My queue" title="Today & overdue" action={<button className="btn sm ghost"><I.More /></button>} noBody>
            <div style={{ padding: "4px 14px 12px" }}>
              {d.tasks.map((t, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: t.priority === "High" ? "var(--st-red)" : t.priority === "Medium" ? "var(--st-amber)" : "var(--st-slate)" }}></span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: "var(--text)" }}>{t.t}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {t.who} · <span className="tabular">{t.due}</span> · <span style={{ color: "var(--accent)" }}>{t.tag}</span>
                    </div>
                  </div>
                  <button className="icon-btn"><I.Check /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </>
  );
}

Object.assign(window, { ViewDashboard });
