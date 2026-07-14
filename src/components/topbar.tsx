"use client";
import { Search, LogOut, Moon, Sun, Bell, Plus, ChevronRight, Menu } from "lucide-react";
import { initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

interface TopbarProps {
  user: { name: string; email: string; role: string };
  onOpenMobileNav?: () => void;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  pipeline: "Pipeline",
  leads: "Leads",
  clients: "Clients",
  events: "Events",
  tasks: "Tasks",
  calendar: "Calendar",
  suppliers: "Suppliers",
  "work-orders": "Work orders",
  checklists: "Checklists",
  "event-day": "Event day",
  ops: "Ops",
  analytics: "Analytics",
  audit: "Audit log",
  settings: "Settings",
  users: "Users",
  account: "Account",
};

const COMMANDS = [
  { label: "Dashboard",    href: "/dashboard",        section: "Go to" },
  { label: "Events",       href: "/events",           section: "Go to" },
  { label: "Leads",        href: "/leads",            section: "Go to" },
  { label: "Pipeline",     href: "/pipeline",         section: "Go to" },
  { label: "Clients",      href: "/clients",          section: "Go to" },
  { label: "Tasks",        href: "/tasks",            section: "Go to" },
  { label: "Suppliers",    href: "/suppliers",        section: "Go to" },
  { label: "Work Orders",  href: "/work-orders",      section: "Go to" },
  { label: "New Lead",     href: "/leads/new",        section: "Create" },
  { label: "New Event",    href: "/events/new",       section: "Create" },
  { label: "New Client",   href: "/clients/new",      section: "Create" },
  { label: "New Task",     href: "/tasks/new",        section: "Create" },
  { label: "New Work Order", href: "/work-orders/new", section: "Create" },
  { label: "New Supplier", href: "/suppliers/new",    section: "Create" },
];

const QUICK_CREATE = [
  { label: "New Lead",       href: "/leads/new" },
  { label: "New Event",      href: "/events/new" },
  { label: "New Client",     href: "/clients/new" },
  { label: "New Task",       href: "/tasks/new" },
  { label: "New Work Order", href: "/work-orders/new" },
  { label: "New Supplier",   href: "/suppliers/new" },
];

export function Topbar({ user, onOpenMobileNav }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [plusOpen, setPlusOpen]   = useState(false);
  const [bellOpen, setBellOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  type RecordResult = { id: string; name: string };
  const [recordResults, setRecordResults] = useState<{ leads: RecordResult[]; events: RecordResult[]; clients: RecordResult[] }>({
    leads: [], events: [], clients: [],
  });
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Search actual leads/events/clients as the user types (debounced)
  useEffect(() => {
    const q = query.trim();
    if (!searchOpen || q.length < 2) {
      setRecordResults({ leads: [], events: [], clients: [] });
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) setRecordResults(await res.json());
      } catch {
        // Palette still works for page navigation even if record search fails
      }
    }, 200);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [query, searchOpen]);

  // ⌘K / Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setQuery("");
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setPlusOpen(false);
        setBellOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 10);
  }, [searchOpen]);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.section.toLowerCase().includes(query.toLowerCase())
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function toggleDark() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  const segments = pathname.split("/").filter(Boolean);
  const section = routeLabels[segments[0]] ?? segments[0];
  const isNested = segments.length > 1;
  const leafLabel = segments[segments.length - 1] === "new"
    ? `New ${routeLabels[segments[0]]?.replace(/s$/, "") ?? "record"}`
    : routeLabels[segments[segments.length - 1]] ?? "Detail";

  // Group filtered results by section, then append real record matches
  const commandSections = ["Go to", "Create"].map((s) => ({
    title: s,
    items: filtered.filter((c) => c.section === s).map((c) => ({ label: c.label, href: c.href })),
  })).filter((s) => s.items.length > 0);

  const recordSections = [
    { title: "Leads", items: recordResults.leads.map((l) => ({ label: l.name, href: `/leads/${l.id}` })) },
    { title: "Events", items: recordResults.events.map((e) => ({ label: e.name, href: `/events/${e.id}` })) },
    { title: "Clients", items: recordResults.clients.map((c) => ({ label: c.name, href: `/clients/${c.id}` })) },
  ].filter((s) => s.items.length > 0);

  const allSections = [...commandSections, ...recordSections];
  const flatItems = allSections.flatMap((s) => s.items);

  function handleCommandKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((v) => Math.min(v + 1, flatItems.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((v) => Math.max(v - 1, 0)); }
    if (e.key === "Enter" && flatItems[cursor]) {
      router.push(flatItems[cursor].href);
      setSearchOpen(false);
    }
  }

  let itemIndex = 0; // running index for cursor tracking across sections

  return (
    <>
      <header className="h-12 border-b border-border bg-surface flex items-center gap-2 px-3 sm:px-[18px] flex-shrink-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileNav}
          aria-label="Open menu"
          className="md:hidden h-8 w-8 grid place-items-center rounded-md hover:bg-hover transition-colors text-text-2 flex-shrink-0"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[13px] text-text-3 min-w-0 flex-1 overflow-hidden whitespace-nowrap">
          <Link href="/dashboard" className="hidden sm:inline hover:text-foreground transition-colors flex-shrink-0">Viva Melbourne</Link>
          <span className="hidden sm:inline opacity-50 flex-shrink-0">/</span>
          {isNested ? (
            <>
              <Link href={`/${segments[0]}`} className="hover:text-foreground transition-colors flex-shrink-0 truncate">{section}</Link>
              <span className="opacity-50 flex-shrink-0">/</span>
              <span className="text-foreground font-medium truncate">{leafLabel}</span>
            </>
          ) : (
            <span className="text-foreground font-medium truncate">{section}</span>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Search trigger */}
          <button
            onClick={() => { setSearchOpen(true); setQuery(""); }}
            aria-label="Search"
            className="flex items-center gap-2 text-[12.5px] text-text-3 border border-border rounded-md h-8 w-8 sm:w-auto sm:h-auto justify-center sm:justify-start px-0 sm:px-2.5 sm:py-[5px] hover:border-border-strong hover:text-text-2 transition-all bg-surface-2 sm:min-w-[220px] lg:min-w-[280px]"
          >
            <Search className="h-[13px] w-[13px] flex-shrink-0" />
            <span className="hidden sm:inline flex-1 text-left truncate">Jump to leads, events, clients…</span>
            <kbd className="hidden sm:inline font-mono text-[10.5px] border border-border rounded px-[5px] py-[1px] bg-surface text-text-3">⌘K</kbd>
          </button>

          {/* Dark mode */}
          <button onClick={toggleDark} className="h-[30px] w-[30px] grid place-items-center rounded-md hover:bg-hover transition-colors text-text-2 border border-transparent hover:border-border">
            {mounted && resolvedTheme === "dark" ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
          </button>

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => { setBellOpen((v) => !v); setPlusOpen(false); setMenuOpen(false); }}
              className="h-[30px] w-[30px] grid place-items-center rounded-md hover:bg-hover transition-colors text-text-2 border border-transparent hover:border-border"
            >
              <Bell className="h-[15px] w-[15px]" />
            </button>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
                <div className="absolute right-0 top-9 z-20 w-72 border border-border bg-surface rounded-lg shadow-pop overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-[12.5px] font-semibold text-foreground">Notifications</p>
                  </div>
                  <div className="px-3 py-8 text-center">
                    <p className="text-[12.5px] text-text-3">No notifications yet.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Plus / quick create */}
          <div className="relative">
            <button
              onClick={() => { setPlusOpen((v) => !v); setBellOpen(false); setMenuOpen(false); }}
              className="h-[30px] w-[30px] grid place-items-center rounded-md hover:bg-hover transition-colors text-text-2 border border-transparent hover:border-border"
            >
              <Plus className="h-[15px] w-[15px]" />
            </button>
            {plusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPlusOpen(false)} />
                <div className="absolute right-0 top-9 z-20 w-48 border border-border bg-surface rounded-lg shadow-pop py-1 overflow-hidden">
                  <p className="px-3 pt-1.5 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-4">Create new</p>
                  {QUICK_CREATE.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setPlusOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-[13px] text-foreground hover:bg-hover transition-colors"
                    >
                      {item.label}
                      <ChevronRight className="h-3.5 w-3.5 text-text-4" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative ml-1">
            <button
              onClick={() => { setMenuOpen((v) => !v); setPlusOpen(false); setBellOpen(false); }}
              className="flex items-center gap-2 hover:bg-hover rounded-md px-2 py-1 transition-colors"
            >
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10.5px] font-semibold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(252 60% 55%), hsl(312 70% 60%))" }}
              >
                {initials(user.name)}
              </div>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-20 w-52 border border-border bg-surface rounded-lg shadow-pop py-1 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, hsl(252 60% 55%), hsl(312 70% 60%))" }}
                      >
                        {initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold truncate">{user.name}</p>
                        <p className="text-[11px] text-text-3 truncate">{user.email}</p>
                        <p className="text-[11px] text-text-3 capitalize mt-0.5">{user.role}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-destructive hover:bg-hover transition-colors"
                  >
                    <LogOut className="h-[13px] w-[13px]" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Command palette */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setSearchOpen(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 bg-surface border border-border rounded-xl shadow-pop overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-border">
              <Search className="h-4 w-4 text-text-3 flex-shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
                onKeyDown={handleCommandKey}
                placeholder="Jump to a page or create something…"
                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-text-4 outline-none"
              />
              <kbd className="font-mono text-[10.5px] border border-border rounded px-[5px] py-[1px] bg-surface-2 text-text-3">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-1.5">
              {flatItems.length === 0 ? (
                <p className="px-3.5 py-3 text-[13px] text-text-3">No results for &ldquo;{query}&rdquo;</p>
              ) : (
                allSections.map((s) => (
                  <div key={s.title}>
                    <p className="px-3.5 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-4">{s.title}</p>
                    {s.items.map((item) => {
                      const idx = itemIndex++;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSearchOpen(false)}
                          className={`flex items-center justify-between px-3.5 py-2 text-[13px] transition-colors ${
                            idx === cursor ? "bg-hover text-foreground" : "text-foreground hover:bg-hover"
                          }`}
                        >
                          {item.label}
                          <ChevronRight className="h-3.5 w-3.5 text-text-4" />
                        </Link>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-3.5 py-2 border-t border-border bg-surface-2 text-[11px] text-text-4">
              <span><kbd className="font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono">↵</kbd> open</span>
              <span><kbd className="font-mono">Esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
