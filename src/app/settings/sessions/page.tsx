import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "@/components/layout/AppLayout";
import { SessionRow } from "./SessionRow";

export const dynamic = "force-dynamic";

export default async function SessionsSettings() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/settings/sessions");
  const sessions = await prisma.authSession.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" }
  });
  return (
    <AppLayout>
      <div className="mx-auto max-w-[780px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="eyebrow mb-4 inline-flex items-center gap-3">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          Settings · Sessions
        </div>
        <h1 className="mb-8 font-serif text-[2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          Active <span className="italic text-accent">devices.</span>
        </h1>
        <div className="card divide-y divide-rule">
          {sessions.length === 0 && <p className="p-6 text-[13px] text-muted">No active sessions.</p>}
          {sessions.map((s) => (
            <SessionRow
              key={s.id}
              id={s.id}
              userAgent={s.userAgent}
              ip={s.ip}
              createdAt={s.createdAt.toISOString()}
              expiresAt={s.expiresAt.toISOString()}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
