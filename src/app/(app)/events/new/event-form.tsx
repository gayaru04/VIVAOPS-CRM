"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createEventSchema } from "@/lib/validators";
import { createEvent } from "@/server/actions/events";
import { ClientSelector } from "./client-selector";
import Link from "next/link";
import * as z from "zod";

type FormValues = z.input<typeof createEventSchema>;

// next/navigation's redirect() throws a special error the framework uses to
// perform the navigation — it must propagate, not be shown as a toast.
function isNextRedirectError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT");
}

export function NewEventForm({ clientList }: { clientList: { id: string; name: string }[] }) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "", clientId: "", type: "wedding", eventDate: "", eventTime: "", endTime: "",
      venue: "", venueAddress: "", guestCount: "", budget: "", notes: "",
    },
  });

  function onSubmit(data: FormValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) fd.set(key, String(value));
    });
    startTransition(async () => {
      try {
        await createEvent(fd);
      } catch (err) {
        if (isNextRedirectError(err)) throw err;
        toast.error(String(err));
      }
    });
  }

  return (
    <>
      <PageHeader eyebrow="Events" title="New Event">
        <Button asChild variant="outline" size="sm"><Link href="/events">Cancel</Link></Button>
      </PageHeader>

      <div className="px-7 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Event Name *</FormLabel>
                  <FormControl><Input placeholder="Hartley Wedding" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="clientId" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Client *</FormLabel>
                  <FormControl>
                    <ClientSelector clients={clientList} value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <SelectInput disabled={isPending} {...field}>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate</option>
                      <option value="birthday">Birthday</option>
                      <option value="gala">Gala</option>
                      <option value="conference">Conference</option>
                      <option value="other">Other</option>
                    </SelectInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="eventDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="eventTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl><Input type="time" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl><Input type="time" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="venue" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Venue</FormLabel>
                  <FormControl><Input placeholder="The Langham Melbourne" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="guestCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guests</FormLabel>
                  <FormControl><Input type="number" placeholder="150" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="budget" render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (AUD)</FormLabel>
                  <FormControl><Input placeholder="45000" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea rows={3} disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>{isPending ? "Creating…" : "Create Event"}</Button>
              <Button asChild variant="outline"><Link href="/events">Cancel</Link></Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
