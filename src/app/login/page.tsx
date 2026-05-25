"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DEMO_EMAIL = "demo@vivamelbourne.com.au";
const DEMO_PASSWORD = "vivaops2024";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDemoFill() {
    setMode("signin");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) { toast.error(error.message); return; }
        toast.success("Account created — you can now sign in.");
        setMode("signin");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); return; }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[360px]">
        {/* Card */}
        <div className="bg-surface border border-border rounded-xl shadow-pop px-8 py-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-7">
            <div
              className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{
                background: "radial-gradient(120% 120% at 0% 0%, hsl(252 78% 72%) 0%, hsl(252 78% 60%) 55%, hsl(252 70% 45%) 100%)",
                boxShadow: "inset 0 1px 0 hsl(252 100% 85% / 0.6)",
              }}
            >
              V
            </div>
            <div>
              <div className="text-[14px] font-semibold tracking-tight text-foreground leading-none">VivaOps</div>
              <div className="text-[11px] text-text-3 mt-0.5">
                {mode === "signin" ? "Sign in to continue" : "Create your account"}
              </div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden mb-5 p-0.5 bg-surface-2 gap-0.5">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-[12.5px] font-medium rounded-md transition-all ${
                  mode === m
                    ? "bg-surface text-foreground shadow-soft"
                    : "text-text-3 hover:text-text-2"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Min 6 characters" : ""} required />
            </div>
            <Button type="submit" className="w-full mt-1" disabled={isPending}>
              {isPending
                ? mode === "signin" ? "Signing in…" : "Creating account…"
                : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {mode === "signin" && (
            <button
              onClick={handleDemoFill}
              className="mt-4 w-full text-[11.5px] text-text-3 hover:text-foreground transition-colors underline underline-offset-4"
            >
              Use demo credentials
            </button>
          )}
        </div>
        <p className="text-center text-[11px] text-text-4 mt-4">Viva Melbourne · Internal use only</p>
      </div>
    </div>
  );
}
