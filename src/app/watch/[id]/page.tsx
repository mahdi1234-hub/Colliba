import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { AppLayout } from "@/components/layout/AppLayout";
import { MuxPlayerClient } from "@/components/video/MuxPlayerClient";
import { CommentsPanel } from "@/components/video/CommentsPanel";
import { BiometricGauge } from "@/components/video/BiometricGauge";
import { LikeButton } from "@/components/video/LikeButton";

export const dynamic = "force-dynamic";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const v = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } }
    }
  });
  if (!v) return notFound();

  await prisma.video.update({
    where: { id: v.id },
    data: { views: { increment: 1 } }
  });

  const me = await getCurrentUser();
  const liked = me
    ? !!(await prisma.like.findUnique({
        where: { userId_videoId: { userId: me.id, videoId: v.id } }
      }))
    : false;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-10">
          <div>
            <div className="border border-rule bg-ink">
              {v.muxPlaybackId ? (
                <MuxPlayerClient
                  playbackId={v.muxPlaybackId}
                  title={v.title}
                  videoId={v.id}
                  durationSec={v.durationSec ?? null}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-parchment">
                  <p className="eyebrow">Processing — the video will be ready in a moment.</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="eyebrow mb-2">{v.tags.join(" · ") || "Video"}</p>
              <h1 className="font-serif text-[2.2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.8rem]">
                {v.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4 text-[13px] text-muted">
                <span>
                  {v.author.name ?? `@${v.author.username}`} · {v.views} views ·{" "}
                  {v._count.likes} ♥ · {v._count.comments} 💬
                </span>
                <div className="flex items-center gap-2">
                  <LikeButton videoId={v.id} initial={liked} />
                </div>
              </div>
              {v.description && (
                <p className="mt-4 max-w-[62ch] whitespace-pre-wrap text-[14px] font-light leading-7 text-muted">
                  {v.description}
                </p>
              )}
            </div>

            {me && (
              <div className="mt-6">
                <BiometricGauge videoId={v.id} />
              </div>
            )}
          </div>

          <CommentsPanel
            videoId={v.id}
            me={me ? { id: me.id, username: me.username, name: me.name } : null}
            partyHost={env.PARTYKIT_HOST}
          />
        </div>
      </div>
    </AppLayout>
  );
}
