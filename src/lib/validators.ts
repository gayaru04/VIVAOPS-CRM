import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(["website", "referral", "social", "email", "phone", "other"]).default("website"),
  eventType: z.enum(["wedding", "corporate", "birthday", "gala", "conference", "other"]).optional().or(z.literal("")),
  eventDate: z.string().optional(),
  estimatedBudget: z.string().optional(),
  guestCount: z.coerce.number().int().positive().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(["new", "contacted", "qualified", "unqualified", "converted"]).optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name required"),
  clientId: z.string().uuid("Invalid client"),
  type: z.enum(["wedding", "corporate", "birthday", "gala", "conference", "other"]).default("wedding"),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  endTime: z.string().optional(),
  venue: z.string().optional(),
  venueAddress: z.string().optional(),
  guestCount: z.coerce.number().int().positive().optional().or(z.literal("")),
  budget: z.string().optional(),
  notes: z.string().optional(),
});

export const updateEventStageSchema = z.object({
  eventId: z.string().uuid(),
  stage: z.enum(["inquiry", "proposal", "contract", "planning", "confirmed", "completed", "cancelled"]),
  note: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  eventId: z.string().uuid().optional().or(z.literal("")),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  dueDate: z.string().optional(),
  assignedTo: z.string().uuid().optional().or(z.literal("")),
});

export const createCommSchema = z.object({
  type: z.enum(["email", "phone", "sms", "whatsapp", "note", "meeting"]),
  direction: z.enum(["inbound", "outbound", "internal"]).default("outbound"),
  subject: z.string().optional(),
  body: z.string().min(1, "Body required"),
  eventId: z.string().uuid().optional().or(z.literal("")),
  leadId: z.string().uuid().optional().or(z.literal("")),
  clientId: z.string().uuid().optional().or(z.literal("")),
  isInternal: z.coerce.boolean().default(false),
});

export const createQuoteSchema = z.object({
  eventId: z.string().uuid(),
  subtotal: z.string(),
  tax: z.string().default("0"),
  total: z.string(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    qty: z.number(),
    rate: z.number(),
    amount: z.number(),
  })).default([]),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name required"),
  category: z.enum(["venue", "catering", "photography", "videography", "flowers", "music", "transport", "styling", "entertainment", "other"]),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  isPreferred: z.coerce.boolean().default(false),
});

export const createWorkOrderSchema = z.object({
  eventId: z.string().uuid(),
  supplierId: z.string().uuid(),
  description: z.string().optional(),
  amount: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const createRunSheetItemSchema = z.object({
  eventId: z.string().uuid(),
  time: z.string(),
  duration: z.coerce.number().int().positive().optional().or(z.literal("")),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  assignedTo: z.string().optional(),
  supplierId: z.string().uuid().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export const inviteUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "manager", "coordinator", "viewer"]).default("coordinator"),
});
