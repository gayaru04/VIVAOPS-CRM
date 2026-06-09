# VivaOPS CRM — Feature Guide & Testing Reference

> **Version:** 0.1 · **Stack:** Next.js 14, Supabase, Drizzle ORM, Tailwind CSS  
> **Live URL:** https://vivaops-crm.vercel.app  
> **Repo:** https://github.com/gayaru04/VIVAOPS-CRM

---

## Table of Contents

1. [Feature Map](#1-feature-map)
2. [How to Use Each Feature](#2-how-to-use-each-feature)
3. [Public Pages](#3-public-pages)
4. [Tester Guide](#4-tester-guide)
5. [Debugger & Developer Reference](#5-debugger--developer-reference)
6. [Known Limitations](#6-known-limitations)

---

## 1. Feature Map

```
VivaOPS CRM
│
├── 🔐 Auth
│   ├── Login (split-screen, dark mode default)
│   └── Account Settings (profile, password, appearance, sign out)
│
├── 📊 Dashboard          — KPI overview, upcoming events, open tasks
│
├── 🔄 Pipeline           — Kanban board of events by stage
│
├── ⭐ Leads              — Prospect tracking, lead source, conversion
│   └── Lead Detail       — Notes, comms log, convert to client/event
│
├── 🏢 Clients            — Client directory
│   └── Client Detail     — Contact info, linked events, comms history
│
├── 📅 Events             — Core module
│   └── Event Detail
│       ├── Overview      — Budget vs actual, NPS score, stage picker
│       ├── Tasks         — Per-event task list
│       ├── Run Sheet     — Timeline of the day, AI generator
│       ├── Quotes        — Line-item quotes with PDF download
│       ├── Files         — Drag-and-drop file uploads
│       ├── Checklists    — Apply templates, check off items
│       ├── Staff         — Assign team members with roles
│       ├── Work Orders   — Supplier orders linked to event
│       └── Comms         — Email/SMS/note log
│
├── ✅ Tasks              — Global task list across all events
│
├── 📦 Suppliers          — Supplier directory with preferred flag
│   └── Work Orders       — Orders sent to suppliers
│
├── ✅ Checklists         — Reusable checklist templates
│
├── 🌅 Event Day          — Live event day view
│
├── ⚙️  Ops Dashboard     — Work orders, upcoming events, open tasks
│
├── 📈 Analytics          — Lead sources, conversion, revenue by type
│
├── 👥 Settings → Users   — Team member management
│
├── 📋 Audit Log          — Full action history
│
└── 🌐 Public Pages
    ├── /inquiry          — Client inquiry form (embeddable)
    └── /survey/[token]   — Post-event NPS survey
```

---

## 2. How to Use Each Feature

### 🔐 Login
- Go to the app URL → login with your email and password
- Click **"Use demo login"** to auto-fill demo credentials
- Toggle **dark/light mode** with the icon in the top-right corner
- First-time users are auto-provisioned with `coordinator` role

---

### 👤 Account Settings
**Access:** Click your name/avatar in the bottom-left sidebar

| Section | What you can do |
|---|---|
| Profile | Change your display name |
| Password | Set a new password (min 6 chars) |
| Appearance | Switch between Light / Dark / System theme |
| Session | Sign out of the app |

---

### 📊 Dashboard
- Shows **KPI cards** — total leads, active events, open tasks, revenue
- **Upcoming events** — next 30 days, click to open
- **Open tasks** — click to mark done or navigate to task

---

### 🔄 Pipeline (Kanban)
- Drag events between columns: `Inquiry → Proposal → Contract → Planning → Confirmed → Completed`
- Each card shows event name, client, date, and guest count
- Click any card to open the full event detail

---

### ⭐ Leads
- **New Lead:** Sidebar → Leads → New Lead button
- Fill in name, contact, event type, estimated budget, source
- **Lead Detail:** View/edit info, log comms, convert to client & event
- **Statuses:** New → Contacted → Qualified → Converted / Unqualified

---

### 🏢 Clients
- **New Client:** Sidebar → Clients → New Client
- Stores name, email, phone, company, address, notes
- Client detail shows all linked events and full comms history
- **Inline create:** On the New Event form, click **"New"** next to the client dropdown to create a client without leaving the page

---

### 📅 Events

#### Creating an Event
1. Sidebar → Events → New Event (top right)
2. Select or create a client inline
3. Fill in name, type, date, venue, guests, budget
4. Click **Create Event**

#### Event Detail Tabs

**Overview**
- Change stage using the stage picker buttons
- When moved to **Confirmed** → confirmation email auto-sends to client
- Budget vs Actual card shows spend from work orders vs budget
- NPS score shown if post-event survey has been completed

**Run Sheet**
- Add items with time + title + description
- Click **"Generate with AI"** → Claude generates a full run sheet based on event details
- Preview generated items → click **"Add all"** to insert them
- **Print run sheet** button → opens clean print page with timeline layout + PDF download

**Quotes**
- Click **New Quote** → add line items (description, qty, rate)
- GST calculated automatically at 10%
- Change status: Draft → Sent → Approved / Rejected
- **Download PDF** → professional invoice-style PDF

**Files**
- Drag and drop files into the upload zone (max 50MB)
- Supports images, PDFs, videos, documents, zip
- Files show upload progress, then download link
- Click trash icon to delete

**Checklists**
- Select a template from the dropdown → click Apply
- Check off items by clicking the checkbox (strikes through when done)
- Manage templates at Sidebar → Checklists

**Staff**
- Assign team members from your org with a role
- Roles: Coordinator, Host, Technician, Photographer, Security, Waitstaff, Other
- Remove staff with the trash icon

**Work Orders**
- Link supplier orders to the event
- Amount contributes to Budget vs Actual calculation

**Comms**
- Log emails, calls, SMS, notes, meetings
- Send reminder emails: Confirmation / 7-day / 1-day / Custom
- All outbound emails are logged automatically

**Calendar Invite**
- Click **"Add to Calendar"** in the event hero to download an `.ics` file
- Works with Google Calendar, Apple Calendar, Outlook

**Clone Event**
- Click **Clone** in the event hero
- Creates a copy with stage reset to `inquiry` and date cleared

---

### ✅ Tasks
- Create tasks from Sidebar → Tasks → New Task
- Assign to an event, set priority (Low / Normal / High / Urgent) and due date
- Mark done with the checkbox
- Tasks also appear in their linked event's Tasks tab

---

### 📦 Suppliers
- Add suppliers with category, contact, email, website
- Mark as **Preferred** to highlight them
- Create work orders directly from supplier detail

---

### ✅ Checklists (Templates)
- Sidebar → Checklists → New template
- Add items (title + description) to the template
- Apply to any event from the event's Checklists tab

---

### 📈 Analytics
- **KPI row:** Total leads, conversion rate, active events, total events
- **Lead source breakdown** — bar chart by source
- **Event stages** — count by current stage
- **Revenue by event type** — quoted revenue bars

---

### 🌅 Event Day
- Live view for running the event on the day
- Shows run sheet in timeline order

---

### ⚙️ Ops Dashboard
- Pending work orders, upcoming events, open tasks
- Designed as a quick operations overview

---

## 3. Public Pages

These pages require **no login** and can be shared externally.

### /inquiry
- Client-facing inquiry form
- Fields: name, email, phone, event type, date, guests, budget, notes
- Submits to the CRM as a new lead
- Can be embedded via iframe on your website

### /survey/[token]
- Post-event NPS survey sent automatically 2 days after a completed event
- Client rates 1–10 and optionally leaves a comment
- Score and comment appear on the event's Overview tab

---

## 4. Tester Guide

### Demo Credentials
```
Email:    demo@vivamelbourne.com.au
Password: vivaops2024
```

### Test Scenarios

#### ✅ Core Flow
1. Log in → check dashboard loads with data
2. Create a new lead → convert to client → create event
3. Move event through pipeline stages (Inquiry → Confirmed)
4. Confirm confirmation email sends (check Comms tab)

#### ✅ Event Features
5. Add run sheet items manually + test AI generation
6. Create a quote with 2–3 line items → download PDF
7. Upload a file → verify it appears with download link
8. Apply a checklist template → check off items
9. Assign a staff member with a role
10. Click "Add to Calendar" → verify .ics downloads

#### ✅ Print / PDF
11. Open run sheet print view → click Print
12. Download run sheet PDF → verify layout
13. Download quote PDF → verify line items and totals

#### ✅ Public Pages
14. Visit `/inquiry` → submit form → check lead appears in CRM
15. Visit `/survey/[token]` with a valid token → submit rating

#### ✅ Account
16. Change display name → verify sidebar updates
17. Switch theme Light → Dark → System
18. Change password → sign out → sign back in with new password

### What to Look For
- Pages that crash or show blank screens
- Forms that submit but data doesn't save
- Numbers that look wrong (totals, counts)
- Buttons that don't respond
- Any error toast messages
- Layout broken on a 13" laptop screen

### How to Report a Bug
Include:
1. **What you were doing** (e.g. "Creating a new quote on the Hartley Wedding event")
2. **What you expected** (e.g. "Quote should appear in the list")
3. **What happened instead** (e.g. "Page showed an error toast")
4. **Screenshot** if possible

---

## 5. Debugger & Developer Reference

### Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| Storage | Supabase Storage (`event-files` bucket) |
| Email | Resend |
| AI | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| PDF | `@react-pdf/renderer` |
| Styling | Tailwind CSS + custom design tokens |
| Deployment | Vercel |

### Key File Locations

```
src/
├── app/
│   ├── (app)/              # All authenticated pages
│   │   ├── events/[id]/    # Event detail + tabs
│   │   ├── account/        # Account settings
│   │   ├── analytics/      # Analytics page
│   │   └── ...
│   ├── api/                # API routes
│   │   ├── events/[id]/ical/           # Calendar download
│   │   ├── events/[id]/generate-runsheet/ # AI run sheet
│   │   ├── events/[id]/run-sheet-pdf/  # Run sheet PDF
│   │   ├── quotes/[id]/pdf/            # Quote PDF
│   │   ├── files/upload/               # File upload
│   │   ├── cron/reminders/             # Daily cron job
│   │   └── survey/[token]/             # NPS survey submit
│   ├── inquiry/            # Public inquiry form
│   └── survey/[token]/     # Public NPS survey
├── lib/
│   ├── db/schema.ts        # Full database schema
│   ├── auth/session.ts     # Auth helpers
│   ├── email.ts            # Email templates + send
│   ├── storage.ts          # Supabase Storage helpers
│   ├── quote-pdf.tsx       # Quote PDF template
│   ├── run-sheet-pdf.tsx   # Run sheet PDF template
│   └── validators.ts       # Zod schemas
├── server/actions/         # Server actions (mutations)
│   ├── events.ts
│   ├── quotes.ts
│   ├── files.ts
│   ├── staff.ts
│   ├── account.ts
│   └── reminders.ts
└── components/
    ├── sidebar.tsx
    ├── topbar.tsx
    └── ui/                 # shadcn components
```

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role (server only)
DATABASE_URL=                     # Postgres connection string
ANTHROPIC_API_KEY=                # Claude AI API key
RESEND_API_KEY=                   # Resend email API key
RESEND_FROM_EMAIL=                # From address e.g. VivaOPS <noreply@domain.com>
NEXT_PUBLIC_APP_URL=              # App base URL (used in NPS email links)
CRON_SECRET=                      # Secret for protecting cron endpoint
```

### Database Tables
| Table | Purpose |
|---|---|
| `organisations` | Multi-tenant org |
| `users` | Team members (mirrors Supabase auth) |
| `leads` | Prospect leads |
| `clients` | Confirmed clients |
| `events` | Events (core table) |
| `event_stage_history` | Stage change log |
| `tasks` | Tasks linked to events |
| `comms` | Communication log |
| `quotes` | Quotes with line items (JSONB) |
| `files` | File metadata (storage in Supabase) |
| `suppliers` | Supplier directory |
| `work_orders` | Orders to suppliers |
| `run_sheet_items` | Event run sheet timeline |
| `checklist_templates` | Reusable checklist templates |
| `checklist_template_items` | Items within templates |
| `event_checklists` | Checklists applied to events |
| `event_checklist_items` | Items within event checklists |
| `event_staff` | Staff assigned to events |
| `nps_responses` | Post-event NPS survey responses |
| `audit_log` | Full audit trail |

### Cron Jobs
Runs daily at 8am UTC via Vercel Cron (`vercel.json`):
- Sends 7-day reminder email to clients
- Sends 1-day reminder email to clients
- Sends NPS survey 2 days after completed events

**Test manually:**
```
GET /api/cron/reminders?secret=<CRON_SECRET>
```

### Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `supabaseKey is required` | Env vars not loaded | Restart dev server after editing `.env.local` |
| `ECONNREFUSED 127.0.0.1:5432` | `DATABASE_URL` missing/wrong | Check `.env.local` has correct Supabase connection string |
| `ENOTFOUND supabase.co` | No internet / DNS issue | Check network, flush DNS, disable VPN |
| `renderToBuffer failed` | PDF font issue | Ensure only `Helvetica`/`Helvetica-Bold` used in PDF templates |
| `MIDDLEWARE_INVOCATION_FAILED` | Missing `NEXT_PUBLIC_` env vars on Vercel | Add vars in Vercel dashboard, redeploy without cache |

### Running Locally
```bash
git clone https://github.com/gayaru04/VIVAOPS-CRM
cd VIVAOPS-CRM
npm install
# Create .env.local with all env vars above
npm run dev
# Open http://localhost:3000
```

### Database Migration (when schema changes)
`drizzle-kit push` has a known bug with Supabase FK introspection. Use the migration script instead:
```bash
node migrate.mjs
```

---

## 6. Known Limitations

| Area | Limitation |
|---|---|
| Mobile | No mobile sidebar — app is desktop-first |
| Email | Requires verified domain in Resend for production sending |
| File uploads | Max 50MB per file |
| AI run sheet | Requires `ANTHROPIC_API_KEY` — skipped if not set |
| PDF fonts | Only Helvetica (built-in PDF font) — no custom fonts |
| User creation | New users must be created manually in Supabase Auth dashboard |
| Calendar | `.ics` is all-day only — no time-specific calendar invites |
| SMS | Twilio integration placeholder — not active |

---

*Generated for VivaOPS CRM v0.1 · Internal use only · Viva Melbourne*
