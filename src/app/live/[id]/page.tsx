import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { AppLayout } from "@/components/layout/AppLayout";
import { MuxLivePlayer } from "@/components/video/MuxLivePlayer";
import { CommentsPanel } from "@/components/video/CommentsPanel";

export const dynamic = "force-dynamic";

export default async function LivePage({ params }: { params: { id: string } }) {
  const live = await prisma.liveStream.findUnique({
    where: { id: params.id },
    include: { host: { select: { id: true, username: true, name: true } } }
  });
  if (!live) return notFound();
  const me = await getCurrentUser();
  const isHost = me?.id === live.hostId;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-10">
          <div>
            <div className="border border-rule bg-ink">
              {live.muxPlaybackId ? (
                <MuxLivePlayer playbackId={live.muxPlaybackId} title={live.title} />
              ) : (
                <div className="flex aspect-video items-center justify-center text-parchment">
                  <p className="eyebrow">Stream not ready</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="eyebrow mb-2 flex items-center gap-2">
                <span className={`inline-block h-[6px] w-[6px] rounded-full ${live.status === "ACTIVE" ? "bg-accent" : "bg-quiet"}`} />
                {live.status}
              </p>
              <h1 className="font-serif text-[2.2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.8rem]">
                {live.title}
              </h1>
              <p className="mt-2 text-[13px] text-muted">Hosted by {live.host.name ?? `@${live.host.username}`}</p>
              {live.description && (
                <p className="mt-4 max-w-[62ch] whitespace-pre-wrap text-[14px] font-light leading-7 text-muted">
                  {live.description}
                </p>
              )}

              {isHost && (
                <div className="mt-6 border border-rule bg-[#efe9df] p-5">
                  <p className="eyebrow mb-3">Host ingest details</p>
                  <p className="mb-2 text-[13px] font-light leading-7 text-muted">
                    Point OBS or any RTMP encoder at the URL below with your stream key.
                  </p>
                  <dl className="grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-[140px_1fr]">
                    <dt className="text-quiet">RTMPS URL</dt>
                    <dd className="break-all font-mono text-ink">rtmps://global-live.mux.com:443/app</dd>
                    <dt className="text-quiet">Stream key</dt>
                    <dd className="break-all font-mono text-ink">{live.streamKey}</dd>
                  </dl>
                </div>
              )}
            </div>
          </div>

          <CommentsPanel
            videoId={`live:${live.id}`}
            me={me ? { id: me.id, username: me.username, name: me.name } : null}
            partyHost={env.PARTYKIT_HOST}
          />
        </div>
      </div>
    </AppLayout>
  );
}
