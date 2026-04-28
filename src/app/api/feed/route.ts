import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildFeed } from "@/lib/recommender";
import { ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getCurrentUser();
  const ids = await buildFeed(me?.id ?? null, 30);
  if (ids.length === 0) return ok({ videos: [] });
  const videos = await prisma.video.findMany({
    where: { id: { in: ids }, status: "READY" },
    include: {
      author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } }
    }
  });
  const byId = new Map(videos.map((v) => [v.id, v]));
  return ok({ videos: ids.map((id) => byId.get(id)).filter(Boolean) });
}
