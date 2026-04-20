import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mux, hasMux } from "@/lib/mux";
import { embed } from "@/lib/embedding";
import { emit } from "@/lib/events";
import { ok, fail } from "@/lib/api";
import { z } from "zod";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const CreateBody = z.object({
  title: z.string().min(1).max(140),
  description: z.string().max(4000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(16).default([])
});

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  if (!hasMux()) return fail("Mux is not configured", 500);
  try {
    const body = CreateBody.parse(await req.json());
    const upload = await mux().video.uploads.create({
      cors_origin: env.APP_URL,
      new_asset_settings: {
        playback_policy: ["public"],
        encoding_tier: "smart",
        normalize_audio: true,
        passthrough: `colliba:${me.id}`
      }
    });
    const video = await prisma.video.create({
      data: {
        authorId: me.id,
        title: body.title,
        description: body.description ?? null,
        tags: body.tags,
        status: "UPLOADING",
        muxUploadId: upload.id
      }
    });
    const embedding = embed(`${body.title}\n\n${body.description ?? ""}\n${body.tags.join(" ")}`);
    await prisma.videoEmbedding.upsert({
      where: { videoId: video.id },
      create: { videoId: video.id, embedding },
      update: { embedding }
    });
    await emit({ kind: "follow", userId: me.id, videoId: video.id, payload: { action: "upload_started" } });
    return ok({
      videoId: video.id,
      uploadUrl: upload.url,
      uploadId: upload.id
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Could not create upload", 500);
  }
}

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  const videos = await prisma.video.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { likes: true, comments: true } } }
  });
  return ok({ videos });
}
