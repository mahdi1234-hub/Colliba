import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "@/components/layout/AppLayout";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/studio/analytics");

  const videos = await prisma.video.findMany({
    where: { authorId: me.id },
    include: { _count: { select: { likes: true, comments: true, engagement: true } } }
  });

  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const totalLikes = videos.reduce((s, v) => s + v._count.likes, 0);
  const totalComments = videos.reduce((s, v) => s + v._count.comments, 0);

  const engagement = await prisma.engagementSample.aggregate({
    where: { video: { authorId: me.id } },
    _avg: { score: true },
    _count: true
  });

  const recent = await prisma.event.findMany({
    where: { video: { authorId: me.id } },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { video: { select: { id: true, title: true } } }
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="eyebrow mb-4 inline-flex items-center gap-3">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          Studio · Analytics
        </div>
        <h1 className="mb-8 font-serif text-[2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          How your work is <span className="italic text-accent">received.</span>
        </h1>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Videos" value={String(videos.length)} />
          <Stat label="Views" value={String(totalViews)} />
          <Stat label="Likes" value={String(totalLikes)} />
          <Stat label="Comments" value={String(totalComments)} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="card p-6">
            <p className="eyebrow mb-3">Biometric engagement</p>
            <p className="font-serif text-[2rem] tracking-[-0.03em] text-ink">
              {engagement._avg.score ? Math.round(engagement._avg.score * 100) : 0}%
            </p>
            <p className="mt-2 text-[12px] text-muted">
              Averaged across {engagement._count} on-device samples from consenting viewers.
            </p>
          </div>

          <div className="card p-6">
            <p className="eyebrow mb-3">Per-video</p>
            <ul className="divide-y divide-rule">
              {videos.length === 0 && <li className="py-2 text-[13px] text-muted">No videos yet.</li>}
              {videos.slice(0, 8).map((v) => (
                <li key={v.id} className="flex items-center justify-between py-2 text-[12px]">
                  <span className="truncate">{v.title}</span>
                  <span className="text-quiet">
                    {v.views} views · {v._count.likes}♥
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 card p-6">
          <p className="eyebrow mb-3">Recent activity stream</p>
          <ul className="divide-y divide-rule">
            {recent.length === 0 && <li className="py-2 text-[13px] text-muted">No events yet.</li>}
            {recent.map((e) => (
              <li key={String(e.id)} className="flex items-center justify-between py-2 text-[12px]">
                <span className="truncate text-muted">
                  <span className="mr-2 inline-block rounded-sm bg-rule px-2 py-[1px] font-mono text-[10px] text-subtle">
                    {e.kind}
                  </span>
                  {e.video?.title ?? "—"}
                </span>
                <span className="text-quiet">{new Date(e.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-6">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-serif text-[1.8rem] tracking-[-0.03em] text-ink">{value}</p>
    </div>
  );
}
