import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreateLiveForm } from "./CreateLiveForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudioLivePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/studio/live");

  const mine = await prisma.liveStream.findMany({
    where: { hostId: me.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="eyebrow mb-4 inline-flex items-center gap-3">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          Studio · Live
        </div>
        <h1 className="mb-8 font-serif text-[2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          Open a <span className="italic text-accent">live room.</span>
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
          <CreateLiveForm />
          <div className="card p-6">
            <p className="eyebrow mb-4">Your rooms</p>
            {mine.length === 0 ? (
              <p className="text-[13px] font-light text-muted">No rooms yet.</p>
            ) : (
              <ul className="divide-y divide-rule">
                {mine.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-serif text-[16px] tracking-[-0.02em] text-ink">{r.title}</p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-quiet">{r.status}</p>
                    </div>
                    <Link href={`/live/${r.id}`} className="btn-ghost text-[11px]">Open</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
