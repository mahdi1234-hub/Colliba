import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { reconcileVideoFromMux } from "@/lib/muxReconcile";
import { AppLayout } from "@/components/layout/AppLayout";
import { MuxPlayerClient } from "@/components/video/MuxPlayerClient";
import { CommentsPanel } from "@/components/video/CommentsPanel";
import { BiometricGauge } from "@/components/video/BiometricGauge";
import { LikeButton } from "@/components/video/LikeButton";
import { WatchAutoRefresh } from "@/components/video/WatchAutoRefresh";

export const dynamic = "force-dynamic";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const initial = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } }
    }
  });
  if (!initial) return notFound();

  const me = await getCurrentUser();
  const isAuthor = !!me && me.id === initial.authorId;

  // If the video isn't READY yet, try to reconcile against Mux directly.
  // This is the fallback when the Mux webhook isn't reaching us — the author
  // (and ultimately everyone, once an asset is ready) can still preview.
  let v = initial;
  if (initial.status !== "READY" || !initial.muxPlaybackId) {
    const reconciled = await reconcileVideoFromMux(initial.id);
    if (reconciled) {
      v = {
        ...initial,
        status: reconciled.status,
        muxAssetId: reconciled.muxAssetId,
        muxPlaybackId: reconciled.muxPlaybackId,
        durationSec: reconciled.durationSec,
        aspectRatio: reconciled.aspectRatio,
        thumbnailUrl: reconciled.thumbnailUrl
      };
    }
  }

  // Visibility:
  //   - READY: anyone can view
  //   - PROCESSING / UPLOADING / ERRORED: only the author can view (preview)
  //   - Anyone else hits 404
  if (v.status !== "READY" && !isAuthor) return notFound();

  await prisma.video.update({
    where: { id: v.id },
    data: { views: { increment: 1 } }
  });

  const liked = me
    ? !!(await prisma.like.findUnique({
        where: { userId_videoId: { userId: me.id, videoId: v.id } }
      }))
    : false;

  const playable = !!v.muxPlaybackId && v.status !== "ERRORED";
  const previewing = isAuthor && v.status !== "READY";

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-10">
          <div>
            <div className="border border-rule bg-ink">
              {playable ? (
                <MuxPlayerClient
                  playbackId={v.muxPlaybackId!}
                  title={v.title}
                  videoId={v.id}
                  durationSec={v.durationSec ?? null}
                />
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 text-parchment">
                  <p className="eyebrow">
                    {v.status === "ERRORED" ? "Mux returned an error for this asset." : "Processing"}
                  </p>
                  <p className="text-[12px] text-parchment/70">
                    {v.status === "ERRORED"
                      ? "Try uploading again."
                      : "Mux is finishing transcoding — this page will refresh automatically."}
                  </p>
                </div>
              )}
            </div>
            {previewing && v.status !== "ERRORED" && <WatchAutoRefresh />}
            {previewing && (
              <div className="mt-3 border border-accent/30 bg-accent/5 px-3 py-2 text-[12px] text-muted">
                Author preview · status: <span className="font-mono text-ink">{v.status}</span>
                {playable
                  ? " — playback ID is live; the public will see this once status is READY."
                  : " — your video is still being prepared by Mux."}
              </div>
            )}

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

            {me && playable && (
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
