import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type MuxEvent = {
  type: string;
  data: {
    id?: string;
    upload_id?: string;
    duration?: number;
    aspect_ratio?: string;
    playback_ids?: { id: string; policy: string }[];
    asset_id?: string;
    status?: string;
    passthrough?: string;
  };
};

export async function POST(req: Request) {
  let event: MuxEvent;
  try {
    event = (await req.json()) as MuxEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const t = event.type;
  const d = event.data ?? ({} as MuxEvent["data"]);
  try {
    if (t === "video.asset.created" || t === "video.asset.ready") {
      const assetId = d.id;
      const uploadId = d.upload_id;
      const playbackId = d.playback_ids?.[0]?.id ?? null;
      const duration = d.duration ?? null;
      const aspect = d.aspect_ratio ?? null;
      if (assetId && uploadId) {
        const video = await prisma.video.findUnique({ where: { muxUploadId: uploadId } });
        if (video) {
          await prisma.video.update({
            where: { id: video.id },
            data: {
              muxAssetId: assetId,
              muxPlaybackId: playbackId ?? video.muxPlaybackId,
              durationSec: duration ?? video.durationSec,
              aspectRatio: aspect ?? video.aspectRatio,
              thumbnailUrl: playbackId ? `https://image.mux.com/${playbackId}/thumbnail.webp?width=960&fit_mode=preserve` : video.thumbnailUrl,
              status: t === "video.asset.ready" ? "READY" : "PROCESSING"
            }
          });
        }
      }
    } else if (t === "video.asset.errored") {
      const assetId = d.id;
      if (assetId) {
        await prisma.video.updateMany({
          where: { muxAssetId: assetId },
          data: { status: "ERRORED" }
        });
      }
    } else if (t === "video.live_stream.active" || t === "video.live_stream.idle" || t === "video.live_stream.disconnected" || t === "video.live_stream.completed") {
      const muxStreamId = d.id;
      if (muxStreamId) {
        const status =
          t === "video.live_stream.active"
            ? "ACTIVE"
            : t === "video.live_stream.completed"
            ? "COMPLETED"
            : t === "video.live_stream.disconnected"
            ? "DISCONNECTED"
            : "IDLE";
        await prisma.liveStream.updateMany({
          where: { muxStreamId },
          data: {
            status: status as "ACTIVE" | "COMPLETED" | "DISCONNECTED" | "IDLE",
            startedAt: status === "ACTIVE" ? new Date() : undefined,
            endedAt: status === "COMPLETED" || status === "DISCONNECTED" ? new Date() : undefined
          }
        });
      }
    }
  } catch (e) {
    // Log-only; do not fail webhook delivery.
    console.error("mux webhook error", e);
  }
  return ok({ received: true });
}
