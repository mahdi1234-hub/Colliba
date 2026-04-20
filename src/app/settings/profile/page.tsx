import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileForm } from "./ProfileForm";

export default async function ProfileSettings() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/settings/profile");
  return (
    <AppLayout>
      <div className="mx-auto max-w-[780px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="eyebrow mb-4 inline-flex items-center gap-3">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          Settings · Profile
        </div>
        <h1 className="mb-8 font-serif text-[2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          How you appear on <span className="italic text-accent">Colliba.</span>
        </h1>
        <ProfileForm me={me} />
      </div>
    </AppLayout>
  );
}
