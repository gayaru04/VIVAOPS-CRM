"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// next/navigation's redirect() throws a special error the framework uses to
// perform the navigation — it must propagate, not be shown as a toast.
function isNextRedirectError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT");
}
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createLeadSchema } from "@/lib/validators";
import { createLead } from "@/server/actions/leads";
import Link from "next/link";
import * as z from "zod";

type FormValues = z.input<typeof createLeadSchema>;

export default function NewLeadPage() {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: "", email: "", phone: "", company: "", source: "website",
      eventType: "", eventDate: "", estimatedBudget: "", guestCount: "", notes: "",
    },
  });

  function onSubmit(data: FormValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) fd.set(key, String(value));
    });
    startTransition(async () => {
      try {
        await createLead(fd);
      } catch (err) {
        if (isNextRedirectError(err)) throw err;
        toast.error(String(err));
      }
    });
  }

  return (
    <>
      <PageHeader eyebrow="Leads" title="New Lead">
        <Button asChild variant="outline" size="sm"><Link href="/leads">Cancel</Link></Button>
      </PageHeader>

      <div className="px-7 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Name *</FormLabel>
                  <FormControl><Input placeholder="Jane Smith" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="jane@example.com" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="+61 4xx xxx xxx" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="source" render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <SelectInput disabled={isPending} {...field}>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="social">Social</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="other">Other</option>
                    </SelectInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="eventType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <SelectInput disabled={isPending} {...field}>
                      <option value="">— Select —</option>
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
                  <FormLabel>Event Date</FormLabel>
                  <FormControl><Input type="date" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="estimatedBudget" render={({ field }) => (
                <FormItem>
                  <FormLabel>Est. Budget (AUD)</FormLabel>
                  <FormControl><Input placeholder="15000" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="guestCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Count</FormLabel>
                  <FormControl><Input type="number" placeholder="120" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Any additional details…" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>{isPending ? "Creating…" : "Create Lead"}</Button>
              <Button asChild variant="outline"><Link href="/leads">Cancel</Link></Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
