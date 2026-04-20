import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "@/components/layout/AppLayout";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/studio");

  const [videoCount, liveCount, totalViews] = await Promise.all([
    prisma.video.count({ where: { authorId: me.id } }),
    prisma.liveStream.count({ where: { hostId: me.id } }),
    prisma.video.aggregate({ where: { authorId: me.id }, _sum: { views: true } })
  ]);

  return (
    <AppLayout>
      <section className="relative border-b border-rule bg-parchment">
        <div className="atmospheric-wash absolute inset-0" />
        <div className="relative mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:px-14">
          <div className="eyebrow mb-4 inline-flex items-center gap-3">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
            Creator studio
          </div>
          <h1 className="font-serif text-[2.2rem] leading-[0.98] tracking-[-0.04em] text-ink sm:text-[3rem]">
            A quiet workspace for <span className="italic text-accent">your work.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Videos" value={String(videoCount)} />
          <Stat label="Live rooms" value={String(liveCount)} />
          <Stat label="Total views" value={String(totalViews._sum.views ?? 0)} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Tile href="/studio/upload" n="01" title="Upload a video" body="Drop a file — Mux handles transcoding and HLS delivery." />
          <Tile href="/studio/library" n="02" title="Library" body="Manage, edit, and remove your published videos." />
          <Tile href="/studio/live" n="03" title="Go live" body="Generate an RTMPS endpoint + stream key in one click." />
          <Tile href="/studio/analytics" n="04" title="Analytics" body="Views, completion, likes, comments, engagement." />
          <Tile href="/settings/profile" n="05" title="Profile" body="Name, username, avatar, and bio." />
          <Tile href="/settings/security" n="06" title="Security" body="Password, active sessions, account." />
        </div>
      </section>
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-6">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-serif text-[2rem] tracking-[-0.03em] text-ink">{value}</p>
    </div>
  );
}

function Tile({ href, n, title, body }: { href: string; n: string; title: string; body: string }) {
  return (
    <Link href={href} className="group card block p-6 transition-colors hover:bg-[#efe9df]">
      <p className="eyebrow mb-3">{n}</p>
      <h3 className="font-serif text-[1.35rem] tracking-[-0.03em] text-ink transition-colors group-hover:text-accent">{title}</h3>
      <p className="mt-3 text-[13px] font-light leading-7 text-muted">{body}</p>
    </Link>
  );
}
