import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding Melbourne demo data…");

  // Check if already seeded
  const existing = await db.select().from(schema.leads).limit(1);
  if (existing.length > 0) {
    console.log("Data already exists — skipping seed (idempotent).");
    await client.end();
    return;
  }

  // Org
  const [org] = await db.insert(schema.organisations).values({
    name: "Viva Melbourne",
  }).returning();

  // Demo user
  const [adminUser] = await db.insert(schema.users).values({
    id: "00000000-0000-0000-0000-000000000001",
    orgId: org.id,
    email: "demo@vivamelbourne.com.au",
    name: "Alex Chen",
    role: "admin",
  }).returning();

  const [coordinator] = await db.insert(schema.users).values({
    id: "00000000-0000-0000-0000-000000000002",
    orgId: org.id,
    email: "sarah@vivamelbourne.com.au",
    name: "Sarah Williams",
    role: "coordinator",
  }).returning();

  // Clients
  const [hartleyClient] = await db.insert(schema.clients).values({
    orgId: org.id,
    name: "James & Olivia Hartley",
    email: "olivia.hartley@gmail.com",
    phone: "+61 412 345 678",
    notes: "VIP couple. Olivia is very detail-oriented. James is relaxed. Aunt Vivian is the wildcard.",
  }).returning();

  const [corporateClient] = await db.insert(schema.clients).values({
    orgId: org.id,
    name: "Apex Financial Group",
    email: "events@apexfinancial.com.au",
    phone: "+61 3 9123 4567",
    company: "Apex Financial Group",
  }).returning();

  const [birthdayClient] = await db.insert(schema.clients).values({
    orgId: org.id,
    name: "Marco Rossi",
    email: "marco.rossi@outlook.com",
    phone: "+61 423 987 654",
  }).returning();

  // Suppliers
  const [florist] = await db.insert(schema.suppliers).values({
    orgId: org.id,
    name: "Blooms & Botanics",
    category: "flowers",
    contactName: "Emma Liu",
    email: "emma@bloomsbotanics.com.au",
    phone: "+61 413 111 222",
    isPreferred: true,
  }).returning();

  const [photographer] = await db.insert(schema.suppliers).values({
    orgId: org.id,
    name: "Golden Hour Photography",
    category: "photography",
    contactName: "Liam Nguyen",
    email: "liam@goldenhour.com.au",
    phone: "+61 425 333 444",
    isPreferred: true,
  }).returning();

  const [caterer] = await db.insert(schema.suppliers).values({
    orgId: org.id,
    name: "Melbourne Fine Dining Catering",
    category: "catering",
    contactName: "Sophie Patel",
    email: "sophie@mfdcatering.com.au",
    phone: "+61 3 8765 4321",
  }).returning();

  const [musician] = await db.insert(schema.suppliers).values({
    orgId: org.id,
    name: "The Harbour Jazz Quartet",
    category: "music",
    contactName: "Tom Hartigan",
    email: "tom@harbourjazz.com.au",
    phone: "+61 408 555 777",
  }).returning();

  // Hartley Wedding — the showpiece event
  const [hartleyWedding] = await db.insert(schema.events).values({
    orgId: org.id,
    clientId: hartleyClient.id,
    name: "Hartley Wedding",
    type: "wedding",
    stage: "planning",
    eventDate: "2026-09-12",
    eventTime: "15:00",
    endTime: "23:00",
    venue: "The Langham Melbourne",
    venueAddress: "1 Southgate Ave, Southbank VIC 3006",
    guestCount: 180,
    budget: "85000",
    assignedTo: coordinator.id,
  }).returning();

  // Stage history
  await db.insert(schema.eventStageHistory).values([
    { eventId: hartleyWedding.id, fromStage: null, toStage: "inquiry", changedBy: adminUser.id, note: "Converted from lead" },
    { eventId: hartleyWedding.id, fromStage: "inquiry", toStage: "proposal", changedBy: adminUser.id },
    { eventId: hartleyWedding.id, fromStage: "proposal", toStage: "contract", changedBy: adminUser.id },
    { eventId: hartleyWedding.id, fromStage: "contract", toStage: "planning", changedBy: coordinator.id },
  ]);

  // Tasks for Hartley Wedding
  await db.insert(schema.tasks).values([
    { orgId: org.id, eventId: hartleyWedding.id, title: "Confirm florist brief", status: "done", priority: "high", assignedTo: coordinator.id, createdBy: adminUser.id, dueDate: "2026-07-01" },
    { orgId: org.id, eventId: hartleyWedding.id, title: "Send final guest list to caterer", status: "in_progress", priority: "high", assignedTo: coordinator.id, createdBy: adminUser.id, dueDate: "2026-08-01" },
    { orgId: org.id, eventId: hartleyWedding.id, title: "Arrange shuttle buses", status: "todo", priority: "normal", assignedTo: coordinator.id, createdBy: adminUser.id, dueDate: "2026-08-15" },
    { orgId: org.id, eventId: hartleyWedding.id, title: "Confirm cake-cutting timing with band", status: "todo", priority: "urgent", assignedTo: coordinator.id, createdBy: adminUser.id, dueDate: "2026-09-01" },
    { orgId: org.id, eventId: hartleyWedding.id, title: "Print run sheet", status: "todo", priority: "normal", createdBy: adminUser.id, dueDate: "2026-09-10" },
  ]);

  // Comms for Hartley Wedding — the "Aunt Vivian" internal note + WhatsApp exchange
  await db.insert(schema.comms).values([
    {
      orgId: org.id,
      eventId: hartleyWedding.id,
      clientId: hartleyClient.id,
      type: "note",
      direction: "internal",
      subject: "⚠️ Aunt Vivian",
      body: "Aunt Vivian (James's side) has strong opinions about the table flower arrangements. She called the florist directly last time and changed the brief. Make sure Emma from Blooms & Botanics only takes direction from us, not guests.",
      sentBy: adminUser.id,
      isInternal: true,
    },
    {
      orgId: org.id,
      eventId: hartleyWedding.id,
      clientId: hartleyClient.id,
      type: "whatsapp",
      direction: "inbound",
      subject: "Cake cut timing",
      body: "Hey! Quick one — can we do the cake cutting at 8:45pm instead of 9pm? The band wants to wrap up by 10:30 and we need buffer time 🎂",
      sentBy: coordinator.id,
      isInternal: false,
    },
    {
      orgId: org.id,
      eventId: hartleyWedding.id,
      clientId: hartleyClient.id,
      type: "whatsapp",
      direction: "outbound",
      subject: "Re: Cake cut timing",
      body: "Absolutely — 8:45pm works perfectly. I'll update the run sheet and let the band know. All sorted! 🎉",
      sentBy: coordinator.id,
      isInternal: false,
    },
    {
      orgId: org.id,
      eventId: hartleyWedding.id,
      clientId: hartleyClient.id,
      type: "email",
      direction: "outbound",
      subject: "Your event proposal — Hartley Wedding",
      body: "Dear Olivia and James,\n\nPlease find attached your detailed event proposal for your wedding on 12 September 2026 at The Langham Melbourne.\n\nWe're thrilled to be part of your special day.\n\nWarm regards,\nSarah Williams\nViva Melbourne",
      sentBy: coordinator.id,
      isInternal: false,
    },
  ]);

  // Work orders
  const [woFlorist] = await db.insert(schema.workOrders).values({
    orgId: org.id,
    eventId: hartleyWedding.id,
    supplierId: florist.id,
    number: "WO-2026-00001",
    status: "confirmed",
    description: "Full floral brief: ceremony arch, 18 table centrepieces, bridal bouquet, 4 bridesmaids bouquets, buttonholes",
    amount: "8500",
    confirmedAt: new Date("2026-06-15"),
    createdBy: adminUser.id,
  }).returning();

  await db.insert(schema.workOrders).values({
    orgId: org.id,
    eventId: hartleyWedding.id,
    supplierId: photographer.id,
    number: "WO-2026-00002",
    status: "confirmed",
    description: "Full day coverage from bridal prep (11am) through to midnight. 2 photographers, 1 videographer.",
    amount: "6200",
    confirmedAt: new Date("2026-05-20"),
    createdBy: adminUser.id,
  });

  await db.insert(schema.workOrders).values({
    orgId: org.id,
    eventId: hartleyWedding.id,
    supplierId: caterer.id,
    number: "WO-2026-00003",
    status: "sent",
    description: "4-course dinner for 180 guests plus canapés during cocktail hour. Dietary requirements: 12 vegan, 8 gluten-free.",
    amount: "32400",
    createdBy: adminUser.id,
  });

  await db.insert(schema.workOrders).values({
    orgId: org.id,
    eventId: hartleyWedding.id,
    supplierId: musician.id,
    number: "WO-2026-00004",
    status: "confirmed",
    description: "Ceremony music (1hr), cocktail hour (2hrs), reception (4hrs). Includes PA setup.",
    amount: "4800",
    confirmedAt: new Date("2026-06-01"),
    createdBy: adminUser.id,
  });

  // Run sheet
  await db.insert(schema.runSheetItems).values([
    { eventId: hartleyWedding.id, time: "11:00", duration: 120, title: "Bridal party hair & makeup", location: "Suite 401 — The Langham", sortOrder: 1 },
    { eventId: hartleyWedding.id, time: "13:30", duration: 60, title: "Photographer arrives — bridal prep shots", location: "Suite 401", assignedTo: "Liam Nguyen", supplierId: photographer.id, sortOrder: 2 },
    { eventId: hartleyWedding.id, time: "14:30", duration: 30, title: "Florist final placement check", location: "Grand Ballroom", assignedTo: "Sarah Williams", supplierId: florist.id, sortOrder: 3 },
    { eventId: hartleyWedding.id, time: "15:00", duration: 30, title: "Ceremony begins", location: "Garden Terrace", sortOrder: 4 },
    { eventId: hartleyWedding.id, time: "15:30", duration: 90, title: "Cocktail hour + canapés", location: "Mezzanine Level", sortOrder: 5 },
    { eventId: hartleyWedding.id, time: "17:00", duration: 15, title: "Guests seated for reception", location: "Grand Ballroom", sortOrder: 6 },
    { eventId: hartleyWedding.id, time: "17:15", duration: 15, title: "Bridal party entrance + first dance", location: "Grand Ballroom", sortOrder: 7 },
    { eventId: hartleyWedding.id, time: "17:30", duration: 90, title: "Entrée + main course", assignedTo: "Sophie Patel", supplierId: caterer.id, sortOrder: 8 },
    { eventId: hartleyWedding.id, time: "19:30", duration: 30, title: "Speeches (4 speakers)", location: "Grand Ballroom", sortOrder: 9 },
    { eventId: hartleyWedding.id, time: "20:15", duration: 30, title: "Dessert service", supplierId: caterer.id, sortOrder: 10 },
    { eventId: hartleyWedding.id, time: "20:45", duration: 15, title: "Cake cutting ceremony", location: "Grand Ballroom", sortOrder: 11 },
    { eventId: hartleyWedding.id, time: "21:00", duration: 90, title: "Dancing — band set 1", supplierId: musician.id, sortOrder: 12 },
    { eventId: hartleyWedding.id, time: "22:30", duration: 30, title: "Band finale + last dance", sortOrder: 13 },
    { eventId: hartleyWedding.id, time: "23:00", duration: 30, title: "Guest departure — shuttle buses depart", location: "Main Entrance", sortOrder: 14 },
  ]);

  // Quotes
  await db.insert(schema.quotes).values({
    orgId: org.id,
    eventId: hartleyWedding.id,
    number: "Q-2026-00001",
    status: "accepted",
    subtotal: "77272.73",
    tax: "7727.27",
    total: "85000.00",
    validUntil: "2026-04-30",
    notes: "Includes all coordination, supplier management, and day-of service. Excludes venue hire.",
    lineItems: JSON.parse(JSON.stringify([
      { description: "Event coordination & management", quantity: 1, unitPrice: "12000.00", amount: "12000.00" },
      { description: "Floral arrangements (Blooms & Botanics)", quantity: 1, unitPrice: "8500.00", amount: "8500.00" },
      { description: "Photography & videography", quantity: 1, unitPrice: "6200.00", amount: "6200.00" },
      { description: "Catering — 180 guests", quantity: 180, unitPrice: "180.00", amount: "32400.00" },
      { description: "Live music (Harbour Jazz Quartet)", quantity: 1, unitPrice: "4800.00", amount: "4800.00" },
      { description: "Transport & shuttle coordination", quantity: 1, unitPrice: "2500.00", amount: "2500.00" },
      { description: "Styling & décor", quantity: 1, unitPrice: "10772.73", amount: "10772.73" },
    ])),
    createdBy: adminUser.id,
  });

  // Second event — corporate
  const [apexEvent] = await db.insert(schema.events).values({
    orgId: org.id,
    clientId: corporateClient.id,
    name: "Apex Q3 Leadership Summit",
    type: "corporate",
    stage: "confirmed",
    eventDate: "2026-07-24",
    eventTime: "08:00",
    endTime: "18:00",
    venue: "MCEC — Melbourne Convention Centre",
    venueAddress: "1 Convention Centre Pl, South Wharf VIC 3006",
    guestCount: 250,
    budget: "65000",
    assignedTo: adminUser.id,
  }).returning();

  // Third event — Marco's 40th
  await db.insert(schema.events).values({
    orgId: org.id,
    clientId: birthdayClient.id,
    name: "Marco's 40th Birthday Gala",
    type: "birthday",
    stage: "proposal",
    eventDate: "2026-10-03",
    venue: "Vue de Monde",
    guestCount: 60,
    budget: "28000",
    assignedTo: coordinator.id,
  });

  // 13 leads
  const leadData = [
    { name: "Olivia Bennett", email: "o.bennett@gmail.com", source: "website" as const, status: "qualified" as const, eventType: "wedding" as const, estimatedBudget: "72000", eventDate: "2027-03-15" },
    { name: "Raj & Priya Sharma", email: "raj.sharma@outlook.com", source: "referral" as const, status: "contacted" as const, eventType: "wedding" as const, estimatedBudget: "95000", eventDate: "2026-12-05" },
    { name: "Melbourne Tech Conf", email: "events@melbtech.io", source: "email" as const, status: "new" as const, eventType: "conference" as const, estimatedBudget: "120000" },
    { name: "The Kim Family", email: "diana.kim@hotmail.com", source: "referral" as const, status: "new" as const, eventType: "birthday" as const, estimatedBudget: "18000" },
    { name: "GreenLeaf Corp", email: "pa@greenleafcorp.com.au", source: "website" as const, status: "qualified" as const, eventType: "corporate" as const, estimatedBudget: "55000" },
    { name: "Natasha Volkov", email: "n.volkov@gmail.com", source: "social" as const, status: "new" as const, eventType: "gala" as const, estimatedBudget: "40000" },
    { name: "Lachlan & Sophie Moore", email: "lach.moore@gmail.com", source: "referral" as const, status: "contacted" as const, eventType: "wedding" as const, estimatedBudget: "88000", eventDate: "2027-05-20" },
    { name: "Danielle Pham", email: "d.pham@yahoo.com", source: "website" as const, status: "unqualified" as const, eventType: "birthday" as const, estimatedBudget: "5000" },
    { name: "Harbour Capital Group", email: "events@harbourcapital.com", source: "phone" as const, status: "qualified" as const, eventType: "corporate" as const, estimatedBudget: "180000" },
    { name: "The O'Brien Family", email: "jenny.obrien@gmail.com", source: "referral" as const, status: "new" as const, eventType: "wedding" as const, estimatedBudget: "65000" },
    { name: "Sunrise Wellness Co.", email: "ceo@sunrisewellness.com.au", source: "social" as const, status: "contacted" as const, eventType: "conference" as const, estimatedBudget: "35000" },
    { name: "Yuki & Hiroshi Tanaka", email: "yuki.t@gmail.com", source: "website" as const, status: "new" as const, eventType: "wedding" as const, estimatedBudget: "105000", eventDate: "2027-01-18" },
    { name: "Chloe Davidson", email: "chloe.dav@gmail.com", source: "referral" as const, status: "new" as const, eventType: "birthday" as const, estimatedBudget: "22000" },
  ];

  for (const lead of leadData) {
    await db.insert(schema.leads).values({
      orgId: org.id,
      name: lead.name,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      eventType: lead.eventType,
      estimatedBudget: lead.estimatedBudget,
      eventDate: lead.eventDate ?? null,
    });
  }

  // Audit log entries
  await db.insert(schema.auditLogs).values([
    { orgId: org.id, actor: adminUser.id, action: "event.created", entityType: "event", entityId: hartleyWedding.id, summary: "Created event: Hartley Wedding" },
    { orgId: org.id, actor: adminUser.id, action: "event.stage_changed", entityType: "event", entityId: hartleyWedding.id, summary: "Stage changed: inquiry → proposal" },
    { orgId: org.id, actor: adminUser.id, action: "event.stage_changed", entityType: "event", entityId: hartleyWedding.id, summary: "Stage changed: proposal → contract" },
    { orgId: org.id, actor: coordinator.id, action: "event.stage_changed", entityType: "event", entityId: hartleyWedding.id, summary: "Stage changed: contract → planning" },
    { orgId: org.id, actor: coordinator.id, action: "work_order.status_changed", entityType: "work_order", summary: "Work order status → confirmed (Blooms & Botanics)" },
    { orgId: org.id, actor: adminUser.id, action: "quote.status_changed", entityType: "quote", summary: "Quote Q-2026-00001 status → accepted" },
  ]);

  console.log("✅ Seed complete.");
  console.log("Demo credentials: demo@vivamelbourne.com.au / vivaops2024");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
