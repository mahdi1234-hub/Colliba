import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mux, hasMux } from "@/lib/mux";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const live = await prisma.liveStream.findUnique({
    where: { id: params.id },
    include: { host: { select: { id: true, username: true, name: true, avatarUrl: true } } }
  });
  if (!live) return fail("Not found", 404);
  const me = await getCurrentUser();
  const isHost = me?.id === live.hostId;
  return ok({
    live: {
      id: live.id,
      title: live.title,
      description: live.description,
      status: live.status,
      playbackId: live.muxPlaybackId,
      host: live.host,
      streamKey: isHost ? live.streamKey : undefined,
      rtmpUrl: isHost ? "rtmps://global-live.mux.com:443/app" : undefined,
      viewerPeak: live.viewerPeak
    }
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  const live = await prisma.liveStream.findUnique({ where: { id: params.id } });
  if (!live) return fail("Not found", 404);
  if (live.hostId !== me.id) return fail("Forbidden", 403);
  if (live.muxStreamId && hasMux()) {
    try {
      await mux().video.liveStreams.delete(live.muxStreamId);
    } catch {
      /* ignore */
    }
  }
  await prisma.liveStream.delete({ where: { id: live.id } });
  return ok({ deleted: true });
}
