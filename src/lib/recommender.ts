// Hybrid recommender: mixes popularity, collaborative (co-view), content (tag overlap + embeddings),
// and a Thompson-sampling bandit layer that personalizes per user.

import { prisma } from "./prisma";
import { scoreArms } from "./bandit";

type Candidate = {
  videoId: string;
  score: number;
  reasons: string[];
};

function cosine(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

export async function buildFeed(userId: string | null, limit = 30): Promise<string[]> {
  const videos = await prisma.video.findMany({
    where: { status: "READY" },
    select: {
      id: true,
      authorId: true,
      tags: true,
      views: true,
      createdAt: true,
      embeddings: { select: { embedding: true } },
      _count: { select: { likes: true, comments: true } }
    },
    take: 500,
    orderBy: { createdAt: "desc" }
  });
  if (videos.length === 0) return [];

  // popularity component (log-scaled + recency)
  const now = Date.now();
  const candidates: Candidate[] = videos.map((v) => {
    const ageDays = (now - v.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const pop =
      Math.log1p(v.views) * 0.4 +
      Math.log1p(v._count.likes) * 0.8 +
      Math.log1p(v._count.comments) * 0.6;
    const freshness = 1 / (1 + ageDays / 7);
    return {
      videoId: v.id,
      score: pop * 0.6 + freshness * 0.4,
      reasons: ["popularity"]
    };
  });

  if (userId) {
    // behavioral signals for this user — liked/viewed tags
    const userEvents = await prisma.event.findMany({
      where: { userId, kind: { in: ["like", "view_complete", "view_progress"] } },
      select: { videoId: true },
      take: 500,
      orderBy: { createdAt: "desc" }
    });
    const recentVideoIds = userEvents.map((e) => e.videoId).filter((x): x is string => !!x);

    const userTagFreq = new Map<string, number>();
    if (recentVideoIds.length) {
      const seen = await prisma.video.findMany({
        where: { id: { in: recentVideoIds } },
        select: { id: true, tags: true, authorId: true, embeddings: { select: { embedding: true } } }
      });
      for (const v of seen) {
        for (const t of v.tags) userTagFreq.set(t, (userTagFreq.get(t) ?? 0) + 1);
      }

      // build a user embedding vector as average of recent-video embeddings
      const userVec: number[] = [];
      let count = 0;
      for (const v of seen) {
        const emb = v.embeddings?.embedding;
        if (emb && emb.length) {
          if (userVec.length === 0) for (let i = 0; i < emb.length; i++) userVec.push(0);
          for (let i = 0; i < emb.length; i++) userVec[i] += emb[i];
          count++;
        }
      }
      if (count > 0) for (let i = 0; i < userVec.length; i++) userVec[i] /= count;

      for (const c of candidates) {
        const v = videos.find((x) => x.id === c.videoId)!;
        // content similarity by tags
        let tagScore = 0;
        for (const t of v.tags) tagScore += userTagFreq.get(t) ?? 0;
        if (tagScore > 0) {
          c.score += Math.log1p(tagScore) * 1.5;
          c.reasons.push("content");
        }
        // collaborative (co-view of author)
        const coAuthor = seen.some((s) => s.authorId === v.authorId) ? 1 : 0;
        if (coAuthor) {
          c.score += 0.6;
          c.reasons.push("collab");
        }
        // semantic similarity via embeddings
        const vEmb = v.embeddings?.embedding;
        if (vEmb && userVec.length) {
          const sim = cosine(userVec, vEmb);
          if (sim > 0) {
            c.score += sim * 1.2;
            c.reasons.push("semantic");
          }
        }
      }

      // bandit layer — tag & author arms
      const armKeys = new Set<string>();
      for (const c of candidates) {
        const v = videos.find((x) => x.id === c.videoId)!;
        for (const t of v.tags) armKeys.add(`tag:${t}`);
        armKeys.add(`creator:${v.authorId}`);
      }
      const banditScores = await scoreArms(userId, Array.from(armKeys));
      for (const c of candidates) {
        const v = videos.find((x) => x.id === c.videoId)!;
        let b = banditScores[`creator:${v.authorId}`] ?? 0.5;
        for (const t of v.tags) b = Math.max(b, banditScores[`tag:${t}`] ?? 0.5);
        c.score += (b - 0.5) * 2; // shift +-1
        c.reasons.push("bandit");
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit).map((c) => c.videoId);
}
