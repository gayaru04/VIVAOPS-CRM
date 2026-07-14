"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, ListTodo, Kanban,
  Star, Truck, ClipboardList, Sunset, BarChart3, ScrollText,
  Building2, CheckSquare, TrendingUp, Settings, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { id: string; label: string; icon: React.ElementType; dimmed?: boolean };
type NavSection = { group: string; items: NavItem[] };

const nav: NavSection[] = [
  {
    group: "Workspace",
    items: [
      { id: "/dashboard",      label: "Dashboard",   icon: LayoutDashboard },
      { id: "/pipeline",       label: "Pipeline",    icon: Kanban },
      { id: "/leads",          label: "Leads",       icon: Star },
      { id: "/clients",        label: "Clients",     icon: Building2 },
      { id: "/events",         label: "Events",      icon: CalendarDays },
      { id: "/tasks",          label: "Tasks",       icon: ListTodo },
      { id: "/calendar",       label: "Calendar",    icon: CalendarDays },
    ],
  },
  {
    group: "Delivery",
    items: [
      { id: "/suppliers",      label: "Suppliers",   icon: Truck },
      { id: "/work-orders",    label: "Work orders", icon: ClipboardList },
      { id: "/checklists",     label: "Checklists",  icon: CheckSquare },
      { id: "/event-day",      label: "Event day",   icon: Sunset },
      { id: "/ops",            label: "Ops",         icon: BarChart3 },
      { id: "/analytics",     label: "Analytics",   icon: TrendingUp },
    ],
  },
  {
    group: "Admin",
    items: [
      { id: "/settings/users", label: "Users",       icon: Users },
      { id: "/audit",          label: "Audit log",   icon: ScrollText },
    ],
  },
];

interface SidebarProps {
  userName?: string;
  userRole?: string;
  counts?: Record<string, number>;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ userName, userRole, counts, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden md:flex flex-col w-[232px] border-r border-border bg-surface-2 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent userName={userName} userRole={userRole} counts={counts} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onCloseMobile} />
          <aside className="relative z-10 flex flex-col w-[264px] max-w-[80vw] h-full bg-surface-2 border-r border-border">
            <button
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="absolute top-2.5 right-2.5 h-7 w-7 grid place-items-center rounded-md text-text-3 hover:bg-hover hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent userName={userName} userRole={userRole} counts={counts} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({
  userName, userRole, counts, onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3.5 border-b border-border h-12 flex-shrink-0">
        <div
          className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
          style={{
            background: "radial-gradient(120% 120% at 0% 0%, hsl(252 78% 72%) 0%, hsl(252 78% 60%) 55%, hsl(252 70% 45%) 100%)",
            boxShadow: "inset 0 1px 0 hsl(252 100% 85% / 0.6), 0 1px 2px rgba(0,0,0,0.15)",
          }}
        >
          V
        </div>
        <span className="text-[13.5px] font-semibold tracking-tight text-foreground leading-none">
          VivaOps <span className="text-text-3 font-normal text-[12px]">· Melbourne</span>
        </span>
        <span className="ml-auto text-[10.5px] text-text-4">v0.1</span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
        {nav.map((section) => (
          <div key={section.group} className="mb-1">
            <div className="px-2 pt-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-4">
              {section.group}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.id || (item.id !== "/dashboard" && pathname.startsWith(item.id + "/"));
              return (
                <Link
                  key={item.id}
                  href={item.id}
                  onClick={onNavigate}
                  style={item.dimmed ? { opacity: 0.55 } : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[5px] px-2 py-[5.5px] text-[13px] transition-colors select-none",
                    active
                      ? "bg-surface border border-border shadow-soft text-foreground py-[4.5px] px-[7px]"
                      : "text-text-2 hover:bg-hover hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-[15px] w-[15px] flex-shrink-0", active ? "text-primary" : "text-text-3")} />
                  <span className="flex-1 min-w-0 truncate">{item.label}</span>
                  {counts?.[item.id] != null && (
                    <span className={cn(
                      "text-[11px] tabular-nums rounded px-[6px] py-[1px]",
                      active ? "bg-surface-2 text-text-4" : "bg-surface-3 text-text-4"
                    )}>
                      {counts[item.id]}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User footer */}
      {userName && (
        <Link
          href="/account"
          onClick={onNavigate}
          className="border-t border-border px-2 py-2 flex items-center gap-2 flex-shrink-0 hover:bg-hover transition-colors group"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10.5px] font-semibold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(252 60% 55%), hsl(312 70% 60%))" }}
          >
            {userName.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] leading-tight font-medium truncate text-foreground">{userName}</div>
            <div className="text-[11px] text-text-3 leading-tight capitalize">{userRole}</div>
          </div>
          <Settings className="h-3.5 w-3.5 text-text-4 group-hover:text-text-2 transition-colors flex-shrink-0" />
        </Link>
      )}
    </>
  );
}
