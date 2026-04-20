import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mux, hasMux } from "@/lib/mux";
import { ok, fail } from "@/lib/api";
import { z } from "zod";

export const runtime = "nodejs";

const CreateBody = z.object({
  title: z.string().min(1).max(140),
  description: z.string().max(4000).optional()
});

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  if (!hasMux()) return fail("Mux is not configured", 500);
  try {
    const body = CreateBody.parse(await req.json());
    const stream = await mux().video.liveStreams.create({
      playback_policy: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
      latency_mode: "low",
      reconnect_window: 60,
      passthrough: `colliba:${me.id}`
    });
    const live = await prisma.liveStream.create({
      data: {
        hostId: me.id,
        title: body.title,
        description: body.description ?? null,
        muxStreamId: stream.id,
        muxPlaybackId: stream.playback_ids?.[0]?.id ?? null,
        streamKey: stream.stream_key,
        status: "IDLE"
      }
    });
    return ok({
      id: live.id,
      muxStreamId: live.muxStreamId,
      playbackId: live.muxPlaybackId,
      streamKey: live.streamKey,
      rtmpUrl: "rtmps://global-live.mux.com:443/app"
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Could not create live stream", 500);
  }
}

export async function GET() {
  const list = await prisma.liveStream.findMany({
    where: { status: { in: ["IDLE", "ACTIVE"] } },
    include: { host: { select: { id: true, username: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 60
  });
  return ok({ streams: list });
}
