import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mux, hasMux } from "@/lib/mux";
import { embed } from "@/lib/embedding";
import { ok, fail } from "@/lib/api";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const v = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } }
    }
  });
  if (!v) return fail("Not found", 404);
  return ok({ video: v });
}

const PatchBody = z.object({
  title: z.string().min(1).max(140).optional(),
  description: z.string().max(4000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(16).optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  const v = await prisma.video.findUnique({ where: { id: params.id } });
  if (!v) return fail("Not found", 404);
  if (v.authorId !== me.id) return fail("Forbidden", 403);
  const body = PatchBody.parse(await req.json());
  const updated = await prisma.video.update({
    where: { id: v.id },
    data: {
      title: body.title ?? v.title,
      description: body.description ?? v.description,
      tags: body.tags ?? v.tags
    }
  });
  const embedding = embed(`${updated.title}\n\n${updated.description ?? ""}\n${updated.tags.join(" ")}`);
  await prisma.videoEmbedding.upsert({
    where: { videoId: updated.id },
    create: { videoId: updated.id, embedding },
    update: { embedding }
  });
  return ok({ video: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  const v = await prisma.video.findUnique({ where: { id: params.id } });
  if (!v) return fail("Not found", 404);
  if (v.authorId !== me.id) return fail("Forbidden", 403);
  if (v.muxAssetId && hasMux()) {
    try {
      await mux().video.assets.delete(v.muxAssetId);
    } catch {
      /* continue */
    }
  }
  await prisma.video.delete({ where: { id: v.id } });
  return ok({ deleted: true });
}
