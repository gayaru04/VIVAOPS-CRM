import { requireUser } from "@/lib/auth/session";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { AppearanceForm } from "./appearance-form";
import { SignOutButton } from "./sign-out-button";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="px-7 pt-6 pb-16 max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary mb-1">Settings</p>
        <h1 className="text-[26px] font-bold tracking-tight text-foreground">My Account</h1>
        <p className="text-[13px] text-text-3 mt-1">Manage your profile, password and preferences.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <Section title="Profile" description="Update your display name and account details.">
          <ProfileForm name={user.name} email={user.email} role={user.role} />
        </Section>

        {/* Password */}
        <Section title="Password" description="Change your login password.">
          {user.email === "demo@vivamelbourne.com.au" ? (
            <p className="text-[13px] text-text-3 max-w-sm">
              Password changes are disabled for the shared demo account.
            </p>
          ) : (
            <PasswordForm />
          )}
        </Section>

        {/* Appearance */}
        <Section title="Appearance" description="Choose how VivaOps looks for you.">
          <AppearanceForm />
        </Section>

        {/* Danger zone */}
        <Section title="Session" description="Sign out of your account on this device.">
          <SignOutButton />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface">
      <div className="px-5 py-4 border-b border-border">
        <p className="text-[13.5px] font-semibold text-foreground">{title}</p>
        <p className="text-[12px] text-text-3 mt-0.5">{description}</p>
      </div>
      <div className="px-5 py-5">
        {children}
      </div>
    </div>
  );
}
