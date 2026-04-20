import { AppLayout } from "@/components/layout/AppLayout";
import { buildFeed } from "@/lib/recommender";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VideoCard } from "@/components/video/VideoCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const me = await getCurrentUser();
  const ids = await buildFeed(me?.id ?? null, 30);
  let videos: Awaited<ReturnType<typeof prisma.video.findMany>> = [];
  if (ids.length) {
    videos = await prisma.video.findMany({
      where: { id: { in: ids }, status: "READY" },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } }
      }
    });
    const byId = new Map(videos.map((v) => [v.id, v]));
    videos = ids.map((i) => byId.get(i)).filter(Boolean) as typeof videos;
  }

  return (
    <AppLayout>
      <section className="relative border-b border-rule bg-parchment">
        <div className="atmospheric-wash absolute inset-0" />
        <div className="relative mx-auto max-w-[1180px] px-5 py-14 sm:px-8 lg:px-14">
          <div className="grid items-end gap-8 lg:grid-cols-[0.34fr_1fr] lg:gap-14">
            <div>
              <div className="eyebrow mb-4 inline-flex items-center gap-3">
                <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
                Feed
              </div>
              <p className="max-w-[16rem] text-[13px] font-light leading-7 text-subtle">
                Personalized from your activity, engagement, and a Thompson-sampling bandit over tags
                and creators.
              </p>
            </div>
            <div>
              <h1 className="font-serif text-[2rem] leading-[0.98] tracking-[-0.04em] text-ink sm:text-[2.8rem]">
                Composed for <span className="italic text-accent">how you watch.</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-14">
        {videos.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="eyebrow mb-3">Empty feed</p>
            <h3 className="font-serif text-[1.6rem] tracking-[-0.03em] text-ink">Be the first to publish.</h3>
            <p className="mx-auto mt-3 max-w-[30rem] text-[14px] font-light leading-7 text-muted">
              No videos are ready yet. Upload something in the studio — it'll appear here after Mux finishes transcoding.
            </p>
            <Link href="/studio/upload" className="btn-accent mt-6 inline-block">Go to studio</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                id={v.id}
                title={v.title}
                tags={v.tags}
                durationSec={v.durationSec}
                thumbnailUrl={v.thumbnailUrl}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                author={(v as any).author}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                likes={(v as any)._count.likes}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                comments={(v as any)._count.comments}
                views={v.views}
              />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
