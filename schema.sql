-- VivaOps CRM — full schema
-- Paste this into Supabase → SQL Editor → Run

-- Enums
CREATE TYPE user_role AS ENUM ('admin','manager','coordinator','viewer');
CREATE TYPE lead_status AS ENUM ('new','contacted','qualified','unqualified','converted');
CREATE TYPE lead_source AS ENUM ('website','referral','social','email','phone','other');
CREATE TYPE event_stage AS ENUM ('inquiry','proposal','contract','planning','confirmed','completed','cancelled');
CREATE TYPE event_type AS ENUM ('wedding','corporate','birthday','gala','conference','other');
CREATE TYPE task_status AS ENUM ('todo','in_progress','done','cancelled');
CREATE TYPE task_priority AS ENUM ('low','normal','high','urgent');
CREATE TYPE comm_type AS ENUM ('email','phone','sms','whatsapp','note','meeting');
CREATE TYPE comm_direction AS ENUM ('inbound','outbound','internal');
CREATE TYPE quote_status AS ENUM ('draft','sent','accepted','rejected','expired');
CREATE TYPE work_order_status AS ENUM ('draft','sent','confirmed','declined','completed');
CREATE TYPE supplier_category AS ENUM ('venue','catering','photography','videography','flowers','music','transport','styling','entertainment','other');
CREATE TYPE checklist_item_status AS ENUM ('pending','done','na');

-- Tables
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organisations(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'coordinator',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source lead_source NOT NULL DEFAULT 'website',
  status lead_status NOT NULL DEFAULT 'new',
  event_type event_type,
  event_date DATE,
  estimated_budget NUMERIC(12,2),
  guest_count INTEGER,
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  converted_at TIMESTAMPTZ,
  converted_to_event_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  lead_id UUID REFERENCES leads(id),
  name TEXT NOT NULL,
  type event_type NOT NULL DEFAULT 'wedding',
  stage event_stage NOT NULL DEFAULT 'inquiry',
  event_date DATE,
  event_time TIME,
  end_time TIME,
  venue TEXT,
  venue_address TEXT,
  guest_count INTEGER,
  budget NUMERIC(12,2),
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  from_stage event_stage,
  to_stage event_stage NOT NULL,
  changed_by UUID REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  event_id UUID REFERENCES events(id),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'normal',
  due_date DATE,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  event_id UUID REFERENCES events(id),
  lead_id UUID REFERENCES leads(id),
  client_id UUID REFERENCES clients(id),
  type comm_type NOT NULL,
  direction comm_direction NOT NULL DEFAULT 'outbound',
  subject TEXT,
  body TEXT NOT NULL,
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_internal BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  event_id UUID NOT NULL REFERENCES events(id),
  number TEXT NOT NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  line_items JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  name TEXT NOT NULL,
  category supplier_category NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  notes TEXT,
  rating INTEGER,
  is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  event_id UUID NOT NULL REFERENCES events(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  number TEXT NOT NULL,
  status work_order_status NOT NULL DEFAULT 'draft',
  description TEXT,
  amount NUMERIC(12,2),
  due_date DATE,
  notes TEXT,
  confirmed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE run_sheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  time TIME NOT NULL,
  duration INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  assigned_to TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  name TEXT NOT NULL,
  description TEXT,
  event_type event_type,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE checklist_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE event_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  template_id UUID REFERENCES checklist_templates(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES event_checklists(id),
  title TEXT NOT NULL,
  description TEXT,
  status checklist_item_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id),
  actor UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  summary TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
