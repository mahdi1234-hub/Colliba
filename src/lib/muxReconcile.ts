import { prisma } from "./prisma";
import { mux, hasMux } from "./mux";

type ReconcileResult = {
  status: "UPLOADING" | "PROCESSING" | "READY" | "ERRORED";
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  durationSec: number | null;
  aspectRatio: string | null;
  thumbnailUrl: string | null;
};

/**
 * Best-effort reconcile of a Video row with Mux's current state.
 * Used as a fallback when the webhook is not configured or hasn't fired yet,
 * so the author can preview their own video without waiting on the webhook.
 *
 * Returns the (possibly updated) video fields. Failures are swallowed —
 * caller should use whatever was on the row already.
 */
export async function reconcileVideoFromMux(videoId: string): Promise<ReconcileResult | null> {
  if (!hasMux()) return null;
  const v = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      status: true,
      muxAssetId: true,
      muxUploadId: true,
      muxPlaybackId: true,
      durationSec: true,
      aspectRatio: true,
      thumbnailUrl: true
    }
  });
  if (!v) return null;
  if (v.status === "READY" && v.muxPlaybackId) {
    return {
      status: v.status,
      muxAssetId: v.muxAssetId,
      muxPlaybackId: v.muxPlaybackId,
      durationSec: v.durationSec,
      aspectRatio: v.aspectRatio,
      thumbnailUrl: v.thumbnailUrl
    };
  }

  try {
    const m = mux();
    let assetId = v.muxAssetId;

    // If we don't have an asset yet, try to resolve it via the upload.
    if (!assetId && v.muxUploadId) {
      try {
        const upload = await m.video.uploads.retrieve(v.muxUploadId);
        if (upload.asset_id) assetId = upload.asset_id;
      } catch (e) {
        console.error("[reconcile] uploads.retrieve failed", e);
      }
    }

    if (!assetId) return null;

    const asset = await m.video.assets.retrieve(assetId);
    const playbackId = asset.playback_ids?.[0]?.id ?? v.muxPlaybackId ?? null;
    const duration = asset.duration ?? v.durationSec ?? null;
    const aspect = asset.aspect_ratio ?? v.aspectRatio ?? null;
    const thumb = playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.webp?width=960&fit_mode=preserve`
      : v.thumbnailUrl ?? null;

    let status: "UPLOADING" | "PROCESSING" | "READY" | "ERRORED" = v.status;
    if (asset.status === "ready") status = "READY";
    else if (asset.status === "errored") status = "ERRORED";
    else status = "PROCESSING";

    await prisma.video.update({
      where: { id: v.id },
      data: {
        muxAssetId: assetId,
        muxPlaybackId: playbackId ?? undefined,
        durationSec: duration ?? undefined,
        aspectRatio: aspect ?? undefined,
        thumbnailUrl: thumb ?? undefined,
        status
      }
    });

    return {
      status,
      muxAssetId: assetId,
      muxPlaybackId: playbackId,
      durationSec: duration,
      aspectRatio: aspect,
      thumbnailUrl: thumb
    };
  } catch (e) {
    console.error("[reconcile] failed", e);
    return null;
  }
}
