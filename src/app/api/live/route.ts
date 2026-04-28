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
  let body: z.infer<typeof CreateBody>;
  try {
    body = CreateBody.parse(await req.json());
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Invalid request body", 400);
  }
  let stream;
  try {
    // Note: latency_mode "low" / "reduced" require a paid Mux account.
    // Default ("standard") works on the free Development environment.
    stream = await mux().video.liveStreams.create({
      playback_policy: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
      reconnect_window: 60,
      passthrough: `colliba:${me.id}`
    });
  } catch (e) {
    const msg =
      e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : String(e);
    console.error("[live] mux.liveStreams.create failed:", msg, e);
    return fail(`Mux error: ${msg}`, 502);
  }
  try {
    const live = await prisma.liveStream.create({
      data: {
        hostId: me.id,
        title: body.title,
        description: body.description ?? null,
        muxStreamId: stream.id,
        muxPlaybackId: stream.playback_ids?.[0]?.id ?? null,
        streamKey: stream.stream_key ?? null,
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
    const msg =
      e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : String(e);
    console.error("[live] prisma.liveStream.create failed:", msg, e);
    return fail(`Database error: ${msg}`, 500);
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
