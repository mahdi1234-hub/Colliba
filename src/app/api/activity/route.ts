import { getCurrentUser } from "@/lib/auth";
import { emit, EventKind } from "@/lib/events";
import { updateArm } from "@/lib/bandit";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({
  kind: z.string().min(1),
  videoId: z.string().optional(),
  payload: z.record(z.any()).optional()
});

const VALID: Record<string, boolean> = {
  view_start: true,
  view_progress: true,
  view_complete: true,
  like: true,
  unlike: true,
  comment: true,
  share: true,
  impression: true,
  click: true,
  search: true,
  live_join: true,
  live_leave: true,
  engagement: true
};

export async function POST(req: Request) {
  const me = await getCurrentUser();
  try {
    const b = Body.parse(await req.json());
    if (!VALID[b.kind]) return fail("Unknown kind", 400);
    await emit({
      kind: b.kind as EventKind,
      userId: me?.id,
      videoId: b.videoId ?? null,
      payload: b.payload ?? {}
    });

    // Bandit update for authenticated users on positive signals.
    if (me && b.videoId) {
      const v = await prisma.video.findUnique({
        where: { id: b.videoId },
        select: { authorId: true, tags: true }
      });
      if (v) {
        let reward = 0;
        if (b.kind === "like") reward = 1;
        else if (b.kind === "view_complete") reward = 0.9;
        else if (b.kind === "share") reward = 0.8;
        else if (b.kind === "comment") reward = 0.7;
        else if (b.kind === "view_progress") {
          const p = typeof b.payload?.progress === "number" ? b.payload.progress : 0;
          reward = Math.max(0, Math.min(1, p));
        } else if (b.kind === "unlike") reward = 0;
        if (reward > 0) {
          await updateArm(me.id, `creator:${v.authorId}`, reward);
          for (const tag of v.tags) await updateArm(me.id, `tag:${tag}`, reward);
        }
      }
    }
    return ok({ received: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Bad request", 400);
  }
}
