import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { PasswordForm } from "./PasswordForm";

export default async function SecuritySettings() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/settings/security");
  return (
    <AppLayout>
      <div className="mx-auto max-w-[780px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="eyebrow mb-4 inline-flex items-center gap-3">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          Settings · Security
        </div>
        <h1 className="mb-8 font-serif text-[2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          Your <span className="italic text-accent">password.</span>
        </h1>
        <PasswordForm />
      </div>
    </AppLayout>
  );
}
