import { db } from "@/lib/db";
import { npsResponses, events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NpsSurveyForm } from "./form";

export default async function SurveyPage({ params }: { params: { token: string } }) {
  const [response] = await db
    .select({ nps: npsResponses, event: events })
    .from(npsResponses)
    .leftJoin(events, eq(npsResponses.eventId, events.id))
    .where(eq(npsResponses.token, params.token))
    .limit(1);

  if (!response) notFound();

  if (response.nps.respondedAt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface border border-border rounded-xl p-8 text-center">
          <h2 className="text-[20px] font-semibold text-foreground mb-2">Already submitted</h2>
          <p className="text-[14px] text-text-3">Thanks — your feedback has already been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="mb-6 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-1">Post-Event Feedback</p>
          <h1 className="text-[22px] font-semibold text-foreground">{response.event?.name ?? "Your Event"}</h1>
          <p className="text-[14px] text-text-3 mt-1">We&apos;d love to know how your event went.</p>
        </div>
        <NpsSurveyForm token={params.token} />
      </div>
    </div>
  );
}
