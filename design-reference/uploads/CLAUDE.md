# CLAUDE.md — VivaOps CRM

Project brief for Claude Code. Read this first; it'll save you a lot of file-traversal.

## What this is

Internal event-operations CRM for **Viva Melbourne** (events agency: weddings, corporate, galas). Single Next.js app over Supabase Postgres + Auth + Storage. Built as a **pitch prototype** with a tuned Linear/Attio aesthetic and a Melbourne-flavored seed dataset.

Covers two phases end-to-end:

- **Phase 1** (sales): leads → clients → events → quotes → cash. Public website inquiry endpoint, role-based access, audit log.
- **Phase 2** (delivery): suppliers, supplier work orders, run sheets, checklist templates, calendar, event-day view, ops dashboard.

## Stack

| Layer    | Choice                                                          |
| -------- | --------------------------------------------------------------- |
| Runtime  | Next.js 14, App Router, React 18, TypeScript strict             |
| Styling  | Tailwind + custom design tokens (Inter, tabular nums, 13–14px)  |
| UI       | shadcn/ui primitives inlined under `src/components/ui/`         |
| Data     | Drizzle ORM + `postgres-js` against Supabase Postgres           |
| Auth     | Supabase Auth (cookie via `@supabase/ssr`)                      |
| Files    | Supabase Storage, signed URLs                                   |
| Forms    | Native server actions + Zod                                     |
| Toasts   | Sonner                                                          |

## One-command setup

```bash
rm -rf node_modules package-lock.json   # the shipped node_modules is sandbox-leftover, may be partial
cp .env.example .env.local              # then fill in Supabase URL + keys + DATABASE_URL
npm install
npm run setup                           # validates env, pushes schema, seeds Melbourne demo data, prints creds
npm run dev
```

Open <http://localhost:3000>, click **"Use demo credentials"** on login.

## Repo layout (the bits worth knowing)

```
src/
├── app/
│   ├── (app)/                  # protected app shell (middleware-guarded)
│   │   ├── layout.tsx          # sidebar + topbar + main
│   │   ├── dashboard/page.tsx  # KPI rail + pipeline bars + recent leads/events
│   │   ├── leads/              # list + new + [id] detail with convert-to-event
│   │   ├── clients/            # list + new + [id] detail
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # ★ centerpiece — tabs: overview / tasks / comms / quotes / files / WOs / run sheet / checklist
│   │   │       ├── run-sheet/  # print-friendly view
│   │   │       └── _components/
│   │   ├── pipeline/page.tsx   # 7-column kanban with inline stage changer
│   │   ├── tasks/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── suppliers/
│   │   ├── work-orders/page.tsx
│   │   ├── checklists/         # template library
│   │   ├── event-day/page.tsx  # readiness tiles + supplier confirms + outstanding work
│   │   ├── ops/page.tsx        # manager view, next 14 days
│   │   ├── settings/users/
│   │   └── audit/page.tsx
│   ├── api/inquiry/route.ts    # public lead capture endpoint
│   ├── login/page.tsx          # auth UI w/ demo-creds prefill
│   └── forbidden/page.tsx
├── components/
│   ├── ui/                     # button, input, select, table, tabs, dialog, card, badge, etc.
│   ├── sidebar.tsx             # Linear-style dense nav
│   ├── topbar.tsx              # faux command bar + user avatar
│   ├── status-badge.tsx        # dot+text status pills
│   ├── kpi.tsx                 # KpiCard + SectionHeading
│   ├── page-header.tsx
│   └── empty-state.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts           # ★ Drizzle schema — all 17+ tables, enums, relations
│   │   ├── index.ts            # postgres-js client
│   │   ├── migrate.ts
│   │   └── seed.ts             # ★ Melbourne demo data (13 leads, 9 events, full Hartley wedding)
│   ├── supabase/{server,client}.ts
│   ├── auth/session.ts         # ★ requireUser, requireRole, can.* gates
│   ├── audit.ts                # logAudit() — call from every mutating server action
│   ├── validators.ts           # Zod schemas, one per domain
│   └── utils.ts                # cn, fmtMoney, fmtDate, initials, slugify
├── server/actions/             # ★ one file per domain — leads, clients, events, tasks, comms, quotes, files, suppliers, work-orders, run-sheet, checklists, users
└── middleware.ts               # session refresh + auth gate
drizzle/0000_init.sql           # full schema as SQL (alternative to db:push)
scripts/setup.ts                # one-command setup
```

## Conventions to keep (don't drift)

1. **Server actions own writes.** Every mutation goes through `src/server/actions/<domain>.ts`. Always: `requireRole(...)` first, then `parse()` with Zod, then DB, then `logAudit(...)`, then `revalidatePath(...)`. Match that order.
2. **RBAC is a function call.** Don't sprinkle role checks in components — call `requireRole("admin", "manager", …)` in the server action, or `can.*` from `lib/auth/session.ts` in server components for conditional UI.
3. **Audit everything that mutates.** `logAudit({ actor, action: "lead.created", entityType: "lead", entityId, summary })`. The action string convention is `<entity>.<verb>` lowercase (e.g. `event.stage_changed`, `work_order.status_changed`).
4. **Status workflows.** All status changes go through dedicated server actions that also write to a history table where applicable (e.g. `event_stage_history`). Don't bypass via direct table update.
5. **No bright fills in status badges.** Use the dot-pill pattern in `components/status-badge.tsx`. New status kinds: add to the map there.
6. **Tables use `tabular-nums`** everywhere money or counts appear. The Tailwind config + `font-feature-settings` in `globals.css` enforce it.
7. **Forms.** `<form action={serverAction}>` directly, with `useTransition` on the client wrapper for pending state. Catch `NEXT_REDIRECT` digests in form catches so toast.error doesn't fire on success-via-redirect.
8. **All decimals in DB are strings.** Drizzle's `numeric` returns strings; convert with `Number(x)` only for math. Always store as `.toString()`.
9. **One organisation today, multi-tenant-ready.** Every row has `org_id`. All queries filter by `user.orgId`. Don't add table access that bypasses this.
10. **Type imports from schema.** `import type { Event, Lead, ... } from "@/lib/db/schema"` — the schema exports `$inferSelect` types for every table.

## Useful scripts

```bash
npm run setup        # one-command: env check + schema push + seed + print creds
npm run dev          # next dev
npm run build        # next build
npm run typecheck    # tsc --noEmit  (clean as of last commit — keep it green)
npm run db:push      # drizzle-kit push (applies src/lib/db/schema.ts to DB)
npm run db:generate  # write a new migration from schema diff
npm run db:migrate   # apply queued migrations
npm run db:seed      # re-seed demo data (idempotent — skips if leads already exist for org)
npm run db:studio    # drizzle-kit studio UI
```

## Known gaps & TODOs (honest list)

These are the things I'd ask Claude Code to look at first if I were the PM:

- [ ] **Pipeline drag-and-drop** — currently inline stage select. Wire `@dnd-kit` if a salesperson asks for it.
- [ ] **Quote acceptance → invoice** — `updateQuoteStatus("accepted")` just flips a status. No Stripe Connect, no PDF render. The QuotePanel "Create quote" form is functional but the email-out is a no-op.
- [ ] **Comms dispatch** — `createComm` only logs. Wire Resend (email), Twilio (SMS), and a WhatsApp Cloud API send for outbound types.
- [ ] **Mobile sidebar** — collapses to nothing below `md`. Should become a sheet/drawer. Important if the team does on-site mobile checks.
- [ ] **Dashboard KPI deltas** — the `delta` props in `dashboard/page.tsx` (`+3 this week`) are **hardcoded**. Replace with period-over-period queries before any real customer sees them.
- [ ] **Supabase RLS** — schema is multi-tenant-ready, every row has `org_id`, all server-side queries filter by `user.orgId`. But Postgres RLS policies are **not** enabled. Enable before exposing direct DB access to anyone.
- [ ] **User invites** — `inviteUser` action creates a Supabase Auth user with `email_confirm: true` and a temp password. There's no email send to the invitee. Need to either pipe through Supabase magic-link or generate an invite token + email.
- [ ] **Search** — the topbar shows a faux `⌘K` command bar but it's not wired. Reasonable next step: lightweight cmdk/Radix combobox over leads + events + clients.
- [ ] **Calendar week view** — only month view exists. Week + agenda views would help coordinators.
- [ ] **Run sheet export** — print view exists at `/events/[id]/run-sheet`. A real PDF render (puppeteer or `@react-pdf/renderer`) would be nicer than browser-print.
- [ ] **Tests** — there are none. Smoke-test the critical server actions (lead convert, stage change, work order confirmation) first.

## Design system rules

Sticking to Linear/Attio language. If a contribution drifts, push back:

- Monochrome base, single accent (`hsl(252 78% 60%)` — Viva purple). No bright fills on status.
- Borders, not shadows. Single subtle `shadow-soft` only on raised surfaces (login card, primary buttons).
- Type scale tightened: body 13–14px, headers max 28px, letter-spacing slightly negative.
- Status badges = dot + text in a bordered pill. Never solid colored backgrounds.
- Tables: borderless rows, `bg-mut/30` header strip, hover-only row tint, tabular numerals for any numeric column.
- KPI numbers in 26px with the label in 11px uppercase-tracking-wide above.
- Action density: prefer `btn-sm` (32px) in toolbars, `btn-default` (36px) on forms.

## Pitch demo flow (15 min)

1. Login → "Use demo credentials" → enter
2. **Dashboard** — KPI rail, pipeline bars, overdue, recent leads, upcoming events
3. **Pipeline** — column totals, value forecast per stage, change a stage
4. **Leads** — filter chips, Attio-style record list, open Olivia Bennett
5. **Convert** any qualified lead → Event
6. **Hartley Wedding event detail** — the showpiece. Walk through every tab. Highlight the "Aunt Vivian" internal note and the WhatsApp cake-cut exchange.
7. **Print run sheet** (`/events/[id]/run-sheet`) — print → save as PDF
8. **Event-day view** — readiness tiles, supplier confirmation status
9. **Ops dashboard** — manager view, next 14 days
10. **Audit log** — pitch the compliance story

## Sibling artifacts

A standalone single-file HTML pitch demo also exists at `../vivaops-prototype.html` (sibling to this folder). It's a vanilla HTML/JS recreation of the same UI for showing the prototype without running the Next.js dev server. Form fields don't persist; stage changers are visual-only. Useful as a no-friction click-through; not part of the buildable app.

## What I'd touch first

If you're picking this up cold:

1. Run `npm run setup` and confirm typecheck stays green (`npm run typecheck` — currently 0 errors).
2. Sign in, click through the demo flow above. Spot anything that feels off.
3. Pick from the **Known gaps** list — supabase RLS and dashboard real-deltas are the two highest-leverage fixes.
4. Before adding features, read `src/server/actions/leads.ts` and `src/lib/auth/session.ts` end-to-end. Those two files set the conventions every other domain follows.
