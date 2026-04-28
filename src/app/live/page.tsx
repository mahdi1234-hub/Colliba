import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LiveListPage() {
  const rooms = await prisma.liveStream.findMany({
    where: { status: { in: ["ACTIVE", "IDLE"] } },
    include: { host: { select: { id: true, username: true, name: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return (
    <AppLayout>
      <section className="relative border-b border-rule bg-parchment">
        <div className="atmospheric-wash absolute inset-0" />
        <div className="relative mx-auto max-w-[1180px] px-5 py-14 sm:px-8 lg:px-14">
          <div className="grid items-end gap-8 lg:grid-cols-[0.34fr_1fr] lg:gap-14">
            <div>
              <div className="eyebrow mb-4 inline-flex items-center gap-3">
                <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
                Live rooms
              </div>
              <p className="max-w-[16rem] text-[13px] font-light leading-7 text-subtle">
                Rooms are ingested with Mux low-latency HLS. Create one from the studio and share the
                link — viewers join in seconds.
              </p>
            </div>
            <div>
              <h1 className="font-serif text-[2rem] leading-[0.98] tracking-[-0.04em] text-ink sm:text-[2.8rem]">
                A quieter stage for <span className="italic text-accent">real-time video.</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-14">
        {rooms.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="eyebrow mb-3">Quiet on stage</p>
            <h3 className="font-serif text-[1.6rem] tracking-[-0.03em] text-ink">Start the first room.</h3>
            <Link href="/studio/live" className="btn-accent mt-6 inline-block">Go to studio</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {rooms.map((r) => (
              <Link key={r.id} href={`/live/${r.id}`} className="group block">
                <div className="video-cover relative border border-rule">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3a5249] to-[#1a2a24] text-parchment">
                    <span className="font-serif text-[22px]">{r.status === "ACTIVE" ? "● LIVE" : "IDLE"}</span>
                  </div>
                  <div className="pointer-events-none absolute inset-4 border border-white/40 sm:inset-5" />
                </div>
                <div className="pt-4">
                  <p className="eyebrow mb-2">{r.status}</p>
                  <h3 className="font-serif text-[1.35rem] leading-[1.05] tracking-[-0.03em] text-ink transition-colors duration-300 group-hover:text-accent">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-[12px] text-muted">Hosted by {r.host.name ?? `@${r.host.username}`}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
