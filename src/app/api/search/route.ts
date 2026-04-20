import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";
import { embed, cosine } from "@/lib/embedding";
import { emit } from "@/lib/events";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const me = await getCurrentUser();
  if (!q) return ok({ videos: [] });
  await emit({ kind: "search", userId: me?.id, payload: { q } });

  // Lexical match (ILIKE) + tag match
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const lexical = await prisma.video.findMany({
    where: {
      status: "READY",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q.toLowerCase()] } }
      ]
    },
    include: {
      author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      embeddings: { select: { embedding: true } },
      _count: { select: { likes: true, comments: true } }
    },
    take: 60
  });

  // Semantic rerank
  const qEmb = embed(q);
  const ranked = lexical
    .map((v) => {
      const sim = v.embeddings?.embedding ? cosine(qEmb, v.embeddings.embedding) : 0;
      const titleMatch = v.title.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
      const tagMatch = v.tags.includes(q.toLowerCase()) ? 1.2 : 0;
      return { v, score: sim * 2 + titleMatch + tagMatch };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ v }) => v);
  // Strip embedding before returning
  return ok({
    videos: ranked.map(({ embeddings: _e, ...rest }) => rest)
  });
  void like; // referenced for future pg_trgm upgrade
}
