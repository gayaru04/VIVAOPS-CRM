/* App entry */

function App() {
  const [route, setRoute] = React.useState("dashboard");
  const [theme, setTheme] = React.useState(() => {
    const saved = localStorage.getItem("vivaops-theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("vivaops-theme", theme);
  }, [theme]);

  // Persist route too — refresh-friendly
  React.useEffect(() => {
    localStorage.setItem("vivaops-route", route);
  }, [route]);

  React.useEffect(() => {
    const saved = localStorage.getItem("vivaops-route");
    if (saved) setRoute(saved);
  }, []);

  // Keyboard: ⌘K dummy focus, "t" to toggle theme
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "t" && !e.metaKey && !e.ctrlKey && !["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)) {
        setTheme(t => t === "dark" ? "light" : "dark");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const views = {
    dashboard:  <ViewDashboard setRoute={setRoute} />,
    pipeline:   <ViewPipeline setRoute={setRoute} />,
    leads:      <ViewLeads setRoute={setRoute} />,
    clients:    <ViewClients />,
    events:     <ViewEvents setRoute={setRoute} />,
    tasks:      <ViewTasks />,
    calendar:   <ViewCalendar />,
    suppliers:  <ViewSuppliers />,
    wo:         <ViewWO />,
    checklists: <ViewChecklists />,
    today:      <ViewEventDay />,
    ops:        <ViewOps />,
    audit:      <ViewAudit />,
    settings:   <ViewSettings />,
    event:      <ViewEventDetail />,
  };

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} />
      <div className="main">
        <Topbar route={route} setRoute={setRoute} theme={theme} setTheme={setTheme} />
        <div className="content" key={route}>
          {views[route] || views.dashboard}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
