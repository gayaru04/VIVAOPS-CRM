import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uuid,
  boolean,
  numeric,
  integer,
  date,
  time,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "coordinator",
  "viewer",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "website",
  "referral",
  "social",
  "email",
  "phone",
  "other",
]);

export const eventStageEnum = pgEnum("event_stage", [
  "inquiry",
  "proposal",
  "contract",
  "planning",
  "confirmed",
  "completed",
  "cancelled",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "wedding",
  "corporate",
  "birthday",
  "gala",
  "conference",
  "other",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
  "cancelled",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const commTypeEnum = pgEnum("comm_type", [
  "email",
  "phone",
  "sms",
  "whatsapp",
  "note",
  "meeting",
]);

export const commDirectionEnum = pgEnum("comm_direction", [
  "inbound",
  "outbound",
  "internal",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
]);

export const workOrderStatusEnum = pgEnum("work_order_status", [
  "draft",
  "sent",
  "confirmed",
  "declined",
  "completed",
]);

export const supplierCategoryEnum = pgEnum("supplier_category", [
  "venue",
  "catering",
  "photography",
  "videography",
  "flowers",
  "music",
  "transport",
  "styling",
  "entertainment",
  "other",
]);

export const checklistItemStatusEnum = pgEnum("checklist_item_status", [
  "pending",
  "done",
  "na",
]);

// ─── Core tables ─────────────────────────────────────────────────────────────

export const organisations = pgTable("organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // matches Supabase auth.users.id
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("coordinator"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  source: leadSourceEnum("source").notNull().default("website"),
  status: leadStatusEnum("status").notNull().default("new"),
  eventType: eventTypeEnum("event_type"),
  eventDate: date("event_date"),
  estimatedBudget: numeric("estimated_budget", { precision: 12, scale: 2 }),
  guestCount: integer("guest_count"),
  notes: text("notes"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  convertedAt: timestamp("converted_at", { withTimezone: true }),
  convertedToEventId: uuid("converted_to_event_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  leadId: uuid("lead_id").references(() => leads.id),
  name: text("name").notNull(),
  type: eventTypeEnum("type").notNull().default("wedding"),
  stage: eventStageEnum("stage").notNull().default("inquiry"),
  eventDate: date("event_date"),
  eventTime: time("event_time"),
  endTime: time("end_time"),
  venue: text("venue"),
  venueAddress: text("venue_address"),
  guestCount: integer("guest_count"),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  notes: text("notes"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventStageHistory = pgTable("event_stage_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  fromStage: eventStageEnum("from_stage"),
  toStage: eventStageEnum("to_stage").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  eventId: uuid("event_id").references(() => events.id),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("normal"),
  dueDate: date("due_date"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const comms = pgTable("comms", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  eventId: uuid("event_id").references(() => events.id),
  leadId: uuid("lead_id").references(() => leads.id),
  clientId: uuid("client_id").references(() => clients.id),
  type: commTypeEnum("type").notNull(),
  direction: commDirectionEnum("direction").notNull().default("outbound"),
  subject: text("subject"),
  body: text("body").notNull(),
  sentBy: uuid("sent_by").references(() => users.id),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  number: text("number").notNull(),
  status: quoteStatusEnum("status").notNull().default("draft"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  tax: numeric("tax", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  validUntil: date("valid_until"),
  notes: text("notes"),
  lineItems: jsonb("line_items").notNull().default("[]"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  eventId: uuid("event_id").references(() => events.id),
  name: text("name").notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  name: text("name").notNull(),
  category: supplierCategoryEnum("category").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  notes: text("notes"),
  rating: integer("rating"),
  isPreferred: boolean("is_preferred").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workOrders = pgTable("work_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  number: text("number").notNull(),
  status: workOrderStatusEnum("status").notNull().default("draft"),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  dueDate: date("due_date"),
  notes: text("notes"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const runSheetItems = pgTable("run_sheet_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  time: time("time").notNull(),
  duration: integer("duration"), // minutes
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  assignedTo: text("assigned_to"),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const checklistTemplates = pgTable("checklist_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  name: text("name").notNull(),
  description: text("description"),
  eventType: eventTypeEnum("event_type"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const checklistTemplateItems = pgTable("checklist_template_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").notNull().references(() => checklistTemplates.id),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const eventChecklists = pgTable("event_checklists", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  templateId: uuid("template_id").references(() => checklistTemplates.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventChecklistItems = pgTable("event_checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  checklistId: uuid("checklist_id").notNull().references(() => eventChecklists.id),
  title: text("title").notNull(),
  description: text("description"),
  status: checklistItemStatusEnum("status").notNull().default("pending"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  dueDate: date("due_date"),
  sortOrder: integer("sort_order").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organisations.id),
  actor: uuid("actor").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  summary: text("summary").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const organisationsRelations = relations(organisations, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  clients: many(clients),
  events: many(events),
}));

export const usersRelations = relations(users, ({ one }) => ({
  org: one(organisations, { fields: [users.orgId], references: [organisations.id] }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  org: one(organisations, { fields: [leads.orgId], references: [organisations.id] }),
  assignedUser: one(users, { fields: [leads.assignedTo], references: [users.id] }),
  comms: many(comms),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  org: one(organisations, { fields: [clients.orgId], references: [organisations.id] }),
  events: many(events),
  comms: many(comms),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  org: one(organisations, { fields: [events.orgId], references: [organisations.id] }),
  client: one(clients, { fields: [events.clientId], references: [clients.id] }),
  lead: one(leads, { fields: [events.leadId], references: [leads.id] }),
  assignedUser: one(users, { fields: [events.assignedTo], references: [users.id] }),
  stageHistory: many(eventStageHistory),
  tasks: many(tasks),
  comms: many(comms),
  quotes: many(quotes),
  files: many(files),
  workOrders: many(workOrders),
  runSheetItems: many(runSheetItems),
  checklists: many(eventChecklists),
}));

export const workOrdersRelations = relations(workOrders, ({ one }) => ({
  event: one(events, { fields: [workOrders.eventId], references: [events.id] }),
  supplier: one(suppliers, { fields: [workOrders.supplierId], references: [suppliers.id] }),
}));

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Organisation = typeof organisations.$inferSelect;
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Event = typeof events.$inferSelect;
export type EventStageHistory = typeof eventStageHistory.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Comm = typeof comms.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type File = typeof files.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type WorkOrder = typeof workOrders.$inferSelect;
export type RunSheetItem = typeof runSheetItems.$inferSelect;
export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;
export type ChecklistTemplateItem = typeof checklistTemplateItems.$inferSelect;
export type EventChecklist = typeof eventChecklists.$inferSelect;
export type EventChecklistItem = typeof eventChecklistItems.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
