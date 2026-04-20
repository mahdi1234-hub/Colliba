import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { emit } from "@/lib/events";
import { updateArm } from "@/lib/bandit";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { videoId: string } }) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  const v = await prisma.video.findUnique({
    where: { id: params.videoId },
    select: { id: true, authorId: true, tags: true }
  });
  if (!v) return fail("Not found", 404);
  const existing = await prisma.like.findUnique({
    where: { userId_videoId: { userId: me.id, videoId: v.id } }
  });
  if (existing) {
    await prisma.like.delete({ where: { userId_videoId: { userId: me.id, videoId: v.id } } });
    await emit({ kind: "unlike", userId: me.id, videoId: v.id });
    return ok({ liked: false });
  }
  await prisma.like.create({ data: { userId: me.id, videoId: v.id } });
  await emit({ kind: "like", userId: me.id, videoId: v.id });
  await updateArm(me.id, `creator:${v.authorId}`, 1);
  for (const t of v.tags) await updateArm(me.id, `tag:${t}`, 1);
  return ok({ liked: true });
}
