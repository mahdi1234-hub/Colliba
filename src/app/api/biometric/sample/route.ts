import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({
  videoId: z.string().min(1),
  t: z.number().finite().min(0),
  score: z.number().finite().min(0).max(1),
  emotions: z.record(z.number()).optional()
});

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  try {
    const b = Body.parse(await req.json());
    await prisma.engagementSample.create({
      data: {
        userId: me.id,
        videoId: b.videoId,
        t: b.t,
        score: b.score,
        emotions: b.emotions ?? {}
      }
    });
    return ok({ stored: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Bad sample", 400);
  }
}
