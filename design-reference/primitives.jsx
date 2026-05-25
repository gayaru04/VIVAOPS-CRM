/* Shared primitives — Badge, Card, etc. */

function Badge({ children, color = "var(--st-slate)", plain = false }) {
  return (
    <span className={"badge" + (plain ? " plain" : "")}>
      <span className="dot" style={{ background: color }}></span>
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    "New":         { c: "var(--st-slate)" },
    "Qualified":   { c: "var(--st-blue)" },
    "Proposal":    { c: "var(--st-violet)" },
    "Negotiation": { c: "var(--st-amber)" },
    "Won":         { c: "var(--st-green)" },
    "Lost":        { c: "var(--st-red)" },
    "On hold":     { c: "var(--st-cyan)" },
    "Confirmed":   { c: "var(--st-green)" },
    "Pending":     { c: "var(--st-amber)" },
    "On track":    { c: "var(--st-green)" },
    "Proposal sent": { c: "var(--st-violet)" },
    "Catering open": { c: "var(--st-amber)" },
    "Walk-through":  { c: "var(--st-blue)" },
    "Deposit due":   { c: "var(--st-red)" },
  };
  const m = map[status] || { c: "var(--st-slate)" };
  return <Badge color={m.c}>{status}</Badge>;
}

function Card({ children, title, eyebrow, action, className = "", noBody = false }) {
  return (
    <div className={"card xhair " + className}>
      {(title || eyebrow || action) && (
        <div className="card-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {eyebrow && <div className="card-eyebrow">{eyebrow}</div>}
            {title && <div className="card-title">{title}</div>}
          </div>
          {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
        </div>
      )}
      {noBody ? children : <div className="card-body">{children}</div>}
    </div>
  );
}

function PageHead({ eyebrow, title, sub, actions }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

function fmtMoney(n) {
  if (typeof n === "string") return n;
  if (n >= 1000) return "$" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
  return "$" + n.toLocaleString();
}

function Avatar({ name, hue = 252, size = 22 }) {
  const initials = name.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase();
  return (
    <span
      className="avt"
      style={{
        width: size, height: size, borderRadius: "50%",
        display: "inline-grid", placeItems: "center",
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 70% 55%))`,
        color: "white",
        fontSize: size <= 22 ? 10 : 11, fontWeight: 600,
      }}
    >{initials}</span>
  );
}

Object.assign(window, { Badge, StatusBadge, Card, PageHead, fmtMoney, Avatar });
