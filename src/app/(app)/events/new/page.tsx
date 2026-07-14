import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NewEventForm } from "./event-form";

export default async function NewEventPage() {
  const user = await requireRole("admin", "manager", "coordinator");
  const clientList = await db.select().from(clients).where(eq(clients.orgId, user.orgId));

  return <NewEventForm clientList={clientList.map((c) => ({ id: c.id, name: c.name }))} />;
}
