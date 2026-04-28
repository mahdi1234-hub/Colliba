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
  if (!q) return ok({ videos: [], creators: [] });
  await emit({ kind: "search", userId: me?.id, payload: { q } });

  // Lexical match (ILIKE) + tag match
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

  // Creator search — match username or name (case-insensitive)
  const creatorRows = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { videos: true, followers: true } }
    },
    take: 24
  });

  const lower = q.toLowerCase();
  const creators = creatorRows
    .map((c) => {
      const u = c.username.toLowerCase();
      const n = (c.name ?? "").toLowerCase();
      let score = 0;
      if (u === lower) score += 5;
      else if (u.startsWith(lower)) score += 3;
      else if (u.includes(lower)) score += 1;
      if (n === lower) score += 4;
      else if (n.startsWith(lower)) score += 2;
      else if (n.includes(lower)) score += 1;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ c }) => c);

  return ok({
    videos: ranked.map(({ embeddings: _e, ...rest }) => rest),
    creators
  });
}
