import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { emit } from "@/lib/events";
import { ok, fail } from "@/lib/api";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { videoId: string } }) {
  const list = await prisma.comment.findMany({
    where: { videoId: params.videoId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { author: { select: { id: true, username: true, name: true, avatarUrl: true } } }
  });
  return ok({ comments: list });
}

const Body = z.object({ body: z.string().min(1).max(1000) });

export async function POST(req: Request, { params }: { params: { videoId: string } }) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  try {
    const b = Body.parse(await req.json());
    const comment = await prisma.comment.create({
      data: { videoId: params.videoId, authorId: me.id, body: b.body.trim() },
      include: { author: { select: { id: true, username: true, name: true, avatarUrl: true } } }
    });
    await emit({ kind: "comment", userId: me.id, videoId: params.videoId, payload: { commentId: comment.id } });
    return ok({ comment });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Bad comment", 400);
  }
}
