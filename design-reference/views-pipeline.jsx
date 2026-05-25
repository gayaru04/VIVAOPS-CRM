/* Pipeline kanban */

function ViewPipeline({ setRoute }) {
  const d = DATA;
  // Distribute leads to stage columns plus extras for visual density.
  const extras = [
    { name: "Hilltop Vineyards",   value: 56000, owner: "Maya",  meta: "Corporate · 80 pax" },
    { name: "Greta · 30th",        value: 14000, owner: "Jules", meta: "Private · 50 pax" },
    { name: "Yara Studios launch", value: 31000, owner: "Ravi",  meta: "Corporate · 120 pax" },
    { name: "Whitfield retreat",   value: 88000, owner: "Maya",  meta: "Corporate · 60 pax" },
    { name: "Lukas + Tilly",       value: 102000,owner: "Maya",  meta: "Wedding · 110 pax" },
    { name: "Hartley Wedding",     value: 168000,owner: "Maya",  meta: "Wedding · 142 pax", pinned: true },
    { name: "Atlas Capital EOFY",  value: 124000,owner: "Jules", meta: "Corporate · 240 pax" },
  ];
  const cardsByStage = {};
  d.pipeline.forEach(p => cardsByStage[p.stage] = []);
  d.leads.forEach(l => {
    if (!cardsByStage[l.stage]) cardsByStage[l.stage] = [];
    cardsByStage[l.stage].push({ name: l.name, value: l.value, owner: l.owner, meta: l.type + " · " + l.source });
  });
  cardsByStage["Won"].unshift({ name: "Hartley Wedding", value: 168000, owner: "Maya", meta: "Wedding · 142 pax", pinned: true });
  cardsByStage["Proposal"].push({ name: "Yara Studios launch", value: 31000, owner: "Ravi", meta: "Corporate · 120 pax" });
  cardsByStage["Qualified"].push({ name: "Hilltop Vineyards", value: 56000, owner: "Maya", meta: "Corporate · 80 pax" });
  cardsByStage["Negotiation"].push({ name: "Lukas + Tilly", value: 102000, owner: "Maya", meta: "Wedding · 110 pax" });
  cardsByStage["New"].push({ name: "Greta · 30th", value: 14000, owner: "Jules", meta: "Private · 50 pax" });

  return (
    <>
      <PageHead
        eyebrow="Sales"
        title="Pipeline"
        sub="36 active deals · $1.2M forecast (weighted) · click a card to open"
        actions={
          <>
            <button className="btn"><I.Filter /> All owners</button>
            <button className="btn"><I.Sort /> Newest</button>
            <button className="btn primary"><I.Plus /> New deal</button>
          </>
        }
      />
      <div style={{ overflowX: "auto" }}>
        <div className="kanban">
          {d.pipeline.map(p => (
            <div key={p.stage} className="kanban-col">
              <div className="kanban-col-head">
                <div className="title">
                  <span className="dot" style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }}></span>
                  {p.stage}
                </div>
                <span className="count">{p.count}</span>
                <span className="val tabular">{fmtMoney(p.value)}</span>
              </div>
              <div className="kanban-list">
                {(cardsByStage[p.stage] || []).slice(0, 6).map((c, i) => (
                  <div
                    key={i}
                    className="kanban-card"
                    onClick={() => c.name === "Hartley Wedding" && setRoute("event")}
                  >
                    <div className="row">
                      <div className="name">{c.name}</div>
                      {c.pinned && <I.Pin style={{ width: 12, height: 12, color: "var(--accent)" }} />}
                    </div>
                    <div className="meta">{c.meta}</div>
                    <div className="row">
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Avatar name={c.owner} hue={140} size={18} />
                        <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.owner}</span>
                      </div>
                      <span className="value tabular">{fmtMoney(c.value)}</span>
                    </div>
                  </div>
                ))}
                <button className="btn sm ghost" style={{ alignSelf: "flex-start", marginTop: 2 }}><I.Plus /> Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ViewPipeline });
