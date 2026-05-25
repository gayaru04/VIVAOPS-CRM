/* App shell — sidebar + topbar + theme toggle */

function Sidebar({ route, setRoute }) {
  const nav = [
    { group: "Workspace", items: [
      { id: "dashboard", label: "Dashboard",   icon: I.Dashboard },
      { id: "pipeline",  label: "Pipeline",    icon: I.Pipeline, count: 36 },
      { id: "leads",     label: "Leads",       icon: I.Lead,     count: 28 },
      { id: "clients",   label: "Clients",     icon: I.Client,   count: 142 },
      { id: "events",    label: "Events",      icon: I.Event,    count: 19 },
      { id: "tasks",     label: "Tasks",       icon: I.Task,     count: 11 },
      { id: "calendar",  label: "Calendar",    icon: I.Calendar },
    ]},
    { group: "Delivery", items: [
      { id: "suppliers", label: "Suppliers",   icon: I.Supplier, count: 47 },
      { id: "wo",        label: "Work orders", icon: I.Doc,      count: 12 },
      { id: "checklists",label: "Checklists",  icon: I.Checklist },
      { id: "today",     label: "Event day",   icon: I.Today },
      { id: "ops",       label: "Ops",         icon: I.Ops },
    ]},
    { group: "Admin", items: [
      { id: "audit",     label: "Audit log",   icon: I.Audit },
      { id: "settings",  label: "Settings",    icon: I.Settings },
    ]},
    { group: "Pinned events", items: [
      { id: "event",     label: "Hartley Wedding", icon: I.Pin, pinned: true },
      { id: "event2",    label: "Atlas · EOFY",    icon: I.Pin, pinned: true, dimmed: true },
    ]},
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-head" onClick={() => setRoute("dashboard")}>
        <div className="sidebar-logo">V</div>
        <div className="sidebar-brand">VivaOps <small>· Melbourne</small></div>
        <div style={{ marginLeft: "auto", color: "var(--text-4)", fontSize: 10.5 }}>v0.42</div>
      </div>
      <div className="sidebar-scroll">
        {nav.map(group => (
          <div key={group.group}>
            <div className="sidebar-section">{group.group}</div>
            {group.items.map(it => {
              const Icon = it.icon;
              const active = route === it.id;
              return (
                <div
                  key={it.id}
                  className={"nav-item" + (active ? " active" : "")}
                  onClick={() => {
                    if (it.id === "event2") return;
                    setRoute(it.id);
                  }}
                  style={it.dimmed ? { opacity: 0.55 } : null}
                >
                  <Icon />
                  <span>{it.label}</span>
                  {it.count != null && <span className="nav-count">{it.count}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="sidebar-foot">
        <Avatar name={DATA.user.name} hue={252} size={26} />
        <div style={{ minWidth: 0 }}>
          <div className="user-name">{DATA.user.name}</div>
          <div className="user-role">{DATA.user.role} · {DATA.org}</div>
        </div>
        <button className="icon-btn" style={{ marginLeft: "auto" }} title="Account"><I.More /></button>
      </div>
    </aside>
  );
}

function Topbar({ route, setRoute, theme, setTheme }) {
  const labels = {
    dashboard: "Dashboard",
    pipeline:  "Pipeline",
    leads:     "Leads",
    clients:   "Clients",
    events:    "Events",
    tasks:     "Tasks",
    calendar:  "Calendar",
    suppliers: "Suppliers",
    wo:        "Work orders",
    checklists:"Checklists",
    today:     "Event day",
    ops:       "Ops",
    audit:     "Audit log",
    settings:  "Settings",
    event:     "Hartley Wedding",
  };
  const crumb = route === "event"
    ? <><span onClick={() => setRoute("events")} style={{cursor: "pointer"}}>Events</span> <span className="sep">/</span> <span className="leaf">Hartley Wedding</span></>
    : <span className="leaf">{labels[route] || route}</span>;

  return (
    <div className="topbar">
      <div className="crumbs">
        <span style={{cursor: "pointer"}} onClick={() => setRoute("dashboard")}>Viva Melbourne</span>
        <span className="sep">/</span>
        {crumb}
      </div>
      <div className="cmd">
        <I.Search />
        <span>Jump to leads, events, clients…</span>
        <span className="kbd">⌘K</span>
      </div>
      <button
        className="icon-btn"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
      >
        {theme === "dark" ? <I.Sun /> : <I.Moon />}
      </button>
      <button className="icon-btn" title="Notifications"><I.Bell /></button>
      <button className="icon-btn" title="New"><I.Plus /></button>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar });
