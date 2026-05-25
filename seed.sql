-- VivaOps CRM — Melbourne demo seed data
-- Paste into Supabase → SQL Editor → Run

-- Organisation
INSERT INTO organisations (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Viva Melbourne');

-- Users (no Supabase Auth linked yet — demo only)
INSERT INTO users (id, org_id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'demo@vivamelbourne.com.au', 'Alex Chen', 'admin'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'sarah@vivamelbourne.com.au', 'Sarah Williams', 'coordinator');

-- Clients
INSERT INTO clients (id, org_id, name, email, phone, notes) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'James & Olivia Hartley', 'olivia.hartley@gmail.com', '+61 412 345 678', 'VIP couple. Aunt Vivian is the wildcard.'),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Apex Financial Group', 'events@apexfinancial.com.au', '+61 3 9123 4567', NULL),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Marco Rossi', 'marco.rossi@outlook.com', '+61 423 987 654', NULL);

-- Suppliers
INSERT INTO suppliers (id, org_id, name, category, contact_name, email, phone, is_preferred) VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Blooms & Botanics', 'flowers', 'Emma Liu', 'emma@bloomsbotanics.com.au', '+61 413 111 222', TRUE),
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', 'Golden Hour Photography', 'photography', 'Liam Nguyen', 'liam@goldenhour.com.au', '+61 425 333 444', TRUE),
  ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000001', 'Melbourne Fine Dining Catering', 'catering', 'Sophie Patel', 'sophie@mfdcatering.com.au', '+61 3 8765 4321', FALSE),
  ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000001', 'The Harbour Jazz Quartet', 'music', 'Tom Hartigan', 'tom@harbourjazz.com.au', '+61 408 555 777', FALSE);

-- Events
INSERT INTO events (id, org_id, client_id, name, type, stage, event_date, event_time, end_time, venue, venue_address, guest_count, budget, assigned_to) VALUES
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', 'Hartley Wedding', 'wedding', 'planning', '2026-09-12', '15:00', '23:00', 'The Langham Melbourne', '1 Southgate Ave, Southbank VIC 3006', 180, 85000, '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 'Apex Q3 Leadership Summit', 'corporate', 'confirmed', '2026-07-24', '08:00', '18:00', 'MCEC — Melbourne Convention Centre', '1 Convention Centre Pl, South Wharf VIC 3006', 250, 65000, '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000022', 'Marco''s 40th Birthday Gala', 'birthday', 'proposal', '2026-10-03', NULL, NULL, 'Vue de Monde', NULL, 60, 28000, '00000000-0000-0000-0000-000000000011');

-- Stage history for Hartley Wedding
INSERT INTO event_stage_history (event_id, from_stage, to_stage, changed_by) VALUES
  ('00000000-0000-0000-0000-000000000040', NULL, 'inquiry', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000040', 'inquiry', 'proposal', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000040', 'proposal', 'contract', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000040', 'contract', 'planning', '00000000-0000-0000-0000-000000000011');

-- Tasks
INSERT INTO tasks (org_id, event_id, title, status, priority, due_date, assigned_to, created_by) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', 'Confirm florist brief', 'done', 'high', '2026-07-01', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', 'Send final guest list to caterer', 'in_progress', 'high', '2026-08-01', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', 'Arrange shuttle buses', 'todo', 'normal', '2026-08-15', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', 'Confirm cake-cutting timing with band', 'todo', 'urgent', '2026-09-01', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', 'Print run sheet', 'todo', 'normal', '2026-09-10', NULL, '00000000-0000-0000-0000-000000000010');

-- Comms (Aunt Vivian note + WhatsApp cake-cut exchange)
INSERT INTO comms (org_id, event_id, client_id, type, direction, subject, body, sent_by, is_internal) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000020', 'note', 'internal', '⚠️ Aunt Vivian', 'Aunt Vivian (James''s side) has strong opinions about the table flower arrangements. She called the florist directly last time and changed the brief. Make sure Emma from Blooms & Botanics only takes direction from us, not guests.', '00000000-0000-0000-0000-000000000010', TRUE),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000020', 'whatsapp', 'inbound', 'Cake cut timing', 'Hey! Quick one — can we do the cake cutting at 8:45pm instead of 9pm? The band wants to wrap up by 10:30 and we need buffer time 🎂', '00000000-0000-0000-0000-000000000011', FALSE),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000020', 'whatsapp', 'outbound', 'Re: Cake cut timing', 'Absolutely — 8:45pm works perfectly. I''ll update the run sheet and let the band know. All sorted! 🎉', '00000000-0000-0000-0000-000000000011', FALSE),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000020', 'email', 'outbound', 'Your event proposal — Hartley Wedding', 'Dear Olivia and James, please find attached your detailed event proposal for your wedding on 12 September 2026 at The Langham Melbourne. We''re thrilled to be part of your special day. Warm regards, Sarah Williams, Viva Melbourne', '00000000-0000-0000-0000-000000000011', FALSE);

-- Work orders
INSERT INTO work_orders (org_id, event_id, supplier_id, number, status, description, amount, confirmed_at, created_by) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000030', 'WO-2026-00001', 'confirmed', 'Full floral brief: ceremony arch, 18 table centrepieces, bridal bouquet, 4 bridesmaids bouquets, buttonholes', 8500, '2026-06-15', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000031', 'WO-2026-00002', 'confirmed', 'Full day coverage from bridal prep (11am) through to midnight. 2 photographers, 1 videographer.', 6200, '2026-05-20', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000032', 'WO-2026-00003', 'sent', '4-course dinner for 180 guests plus canapés during cocktail hour. Dietary: 12 vegan, 8 gluten-free.', 32400, NULL, '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000033', 'WO-2026-00004', 'confirmed', 'Ceremony music (1hr), cocktail hour (2hrs), reception (4hrs). Includes PA setup.', 4800, '2026-06-01', '00000000-0000-0000-0000-000000000010');

-- Run sheet
INSERT INTO run_sheet_items (event_id, time, duration, title, location, assigned_to, supplier_id, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000040', '11:00', 120, 'Bridal party hair & makeup', 'Suite 401 — The Langham', NULL, NULL, 1),
  ('00000000-0000-0000-0000-000000000040', '13:30', 60, 'Photographer arrives — bridal prep shots', 'Suite 401', 'Liam Nguyen', '00000000-0000-0000-0000-000000000031', 2),
  ('00000000-0000-0000-0000-000000000040', '14:30', 30, 'Florist final placement check', 'Grand Ballroom', 'Sarah Williams', '00000000-0000-0000-0000-000000000030', 3),
  ('00000000-0000-0000-0000-000000000040', '15:00', 30, 'Ceremony begins', 'Garden Terrace', NULL, NULL, 4),
  ('00000000-0000-0000-0000-000000000040', '15:30', 90, 'Cocktail hour + canapés', 'Mezzanine Level', NULL, NULL, 5),
  ('00000000-0000-0000-0000-000000000040', '17:00', 15, 'Guests seated for reception', 'Grand Ballroom', NULL, NULL, 6),
  ('00000000-0000-0000-0000-000000000040', '17:15', 15, 'Bridal party entrance + first dance', 'Grand Ballroom', NULL, NULL, 7),
  ('00000000-0000-0000-0000-000000000040', '17:30', 90, 'Entrée + main course', NULL, 'Sophie Patel', '00000000-0000-0000-0000-000000000032', 8),
  ('00000000-0000-0000-0000-000000000040', '19:30', 30, 'Speeches (4 speakers)', 'Grand Ballroom', NULL, NULL, 9),
  ('00000000-0000-0000-0000-000000000040', '20:15', 30, 'Dessert service', NULL, NULL, '00000000-0000-0000-0000-000000000032', 10),
  ('00000000-0000-0000-0000-000000000040', '20:45', 15, 'Cake cutting ceremony', 'Grand Ballroom', NULL, NULL, 11),
  ('00000000-0000-0000-0000-000000000040', '21:00', 90, 'Dancing — band set 1', NULL, NULL, '00000000-0000-0000-0000-000000000033', 12),
  ('00000000-0000-0000-0000-000000000040', '22:30', 30, 'Band finale + last dance', NULL, NULL, NULL, 13),
  ('00000000-0000-0000-0000-000000000040', '23:00', 30, 'Guest departure — shuttle buses', 'Main Entrance', NULL, NULL, 14);

-- Quote
INSERT INTO quotes (org_id, event_id, number, status, subtotal, tax, total, valid_until, notes, line_items, created_by) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', 'Q-2026-00001', 'accepted', 77272.73, 7727.27, 85000.00, '2026-04-30', 'Includes all coordination, supplier management, and day-of service. Excludes venue hire.',
  '[{"description":"Event coordination & management","quantity":1,"unitPrice":"12000.00","amount":"12000.00"},{"description":"Floral arrangements","quantity":1,"unitPrice":"8500.00","amount":"8500.00"},{"description":"Photography & videography","quantity":1,"unitPrice":"6200.00","amount":"6200.00"},{"description":"Catering — 180 guests","quantity":180,"unitPrice":"180.00","amount":"32400.00"},{"description":"Live music","quantity":1,"unitPrice":"4800.00","amount":"4800.00"},{"description":"Transport & shuttle","quantity":1,"unitPrice":"2500.00","amount":"2500.00"},{"description":"Styling & décor","quantity":1,"unitPrice":"10772.73","amount":"10772.73"}]',
  '00000000-0000-0000-0000-000000000010');

-- Leads (13 Melbourne prospects)
INSERT INTO leads (org_id, name, email, source, status, event_type, estimated_budget, event_date) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Olivia Bennett', 'o.bennett@gmail.com', 'website', 'qualified', 'wedding', 72000, '2027-03-15'),
  ('00000000-0000-0000-0000-000000000001', 'Raj & Priya Sharma', 'raj.sharma@outlook.com', 'referral', 'contacted', 'wedding', 95000, '2026-12-05'),
  ('00000000-0000-0000-0000-000000000001', 'Melbourne Tech Conf', 'events@melbtech.io', 'email', 'new', 'conference', 120000, NULL),
  ('00000000-0000-0000-0000-000000000001', 'The Kim Family', 'diana.kim@hotmail.com', 'referral', 'new', 'birthday', 18000, NULL),
  ('00000000-0000-0000-0000-000000000001', 'GreenLeaf Corp', 'pa@greenleafcorp.com.au', 'website', 'qualified', 'corporate', 55000, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Natasha Volkov', 'n.volkov@gmail.com', 'social', 'new', 'gala', 40000, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Lachlan & Sophie Moore', 'lach.moore@gmail.com', 'referral', 'contacted', 'wedding', 88000, '2027-05-20'),
  ('00000000-0000-0000-0000-000000000001', 'Danielle Pham', 'd.pham@yahoo.com', 'website', 'unqualified', 'birthday', 5000, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Harbour Capital Group', 'events@harbourcapital.com', 'phone', 'qualified', 'corporate', 180000, NULL),
  ('00000000-0000-0000-0000-000000000001', 'The O''Brien Family', 'jenny.obrien@gmail.com', 'referral', 'new', 'wedding', 65000, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Sunrise Wellness Co.', 'ceo@sunrisewellness.com.au', 'social', 'contacted', 'conference', 35000, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Yuki & Hiroshi Tanaka', 'yuki.t@gmail.com', 'website', 'new', 'wedding', 105000, '2027-01-18'),
  ('00000000-0000-0000-0000-000000000001', 'Chloe Davidson', 'chloe.dav@gmail.com', 'referral', 'new', 'birthday', 22000, NULL);

-- Audit log
INSERT INTO audit_logs (org_id, actor, action, entity_type, entity_id, summary) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'event.created', 'event', '00000000-0000-0000-0000-000000000040', 'Created event: Hartley Wedding'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'event.stage_changed', 'event', '00000000-0000-0000-0000-000000000040', 'Stage changed: inquiry → proposal'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'event.stage_changed', 'event', '00000000-0000-0000-0000-000000000040', 'Stage changed: proposal → contract'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'event.stage_changed', 'event', '00000000-0000-0000-0000-000000000040', 'Stage changed: contract → planning'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'quote.status_changed', 'quote', NULL, 'Quote Q-2026-00001 status → accepted');
