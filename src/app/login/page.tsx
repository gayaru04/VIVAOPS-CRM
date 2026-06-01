"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  rememberMe: z.boolean().default(false).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (error) { toast.error(error.message); return; }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo() {
    form.setValue("email", "demo@vivamelbourne.com.au");
    form.setValue("password", "vivaops2024");
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row">
      {/* Left panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-background p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6">

            {/* Logo */}
            <motion.div variants={itemVariants} className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0"
                style={{
                  background: "radial-gradient(120% 120% at 0% 0%, hsl(252 78% 72%) 0%, hsl(252 78% 60%) 55%, hsl(252 70% 45%) 100%)",
                  boxShadow: "inset 0 1px 0 hsl(252 100% 85% / 0.6), 0 1px 3px rgba(0,0,0,0.15)",
                }}
              >
                V
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-tight text-foreground leading-none">VivaOps</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Event Management · Melbourne</div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
            </motion.div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <FormField control={form.control} name="rememberMe" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                      </FormControl>
                      <FormLabel className="font-normal text-sm cursor-pointer">Remember me</FormLabel>
                    </FormItem>
                  )} />
                  <button type="button" onClick={fillDemo} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                    Use demo login
                  </button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                </motion.div>
              </form>
            </Form>

            <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground">
              VivaOps · Internal use only
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — image */}
      <div className="relative hidden md:block md:w-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"
          alt="Elegant event venue with beautiful lighting"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-white text-xl font-semibold leading-snug drop-shadow">
            Every detail, perfectly managed.
          </p>
          <p className="text-white/70 text-sm mt-1 drop-shadow">
            Melbourne&apos;s premier event operations platform.
          </p>
        </div>
      </div>
    </div>
  );
}
