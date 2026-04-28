import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  return ok({ user: me });
}

const Body = z.object({
  name: z.string().min(1).max(60).optional(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/i)
    .optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional()
});

export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  try {
    const b = Body.parse(await req.json());
    if (b.username && b.username !== me.username) {
      const taken = await prisma.user.findUnique({ where: { username: b.username.toLowerCase() } });
      if (taken) return fail("Username is taken");
    }
    const updated = await prisma.user.update({
      where: { id: me.id },
      data: {
        name: b.name ?? undefined,
        username: b.username ? b.username.toLowerCase() : undefined,
        bio: b.bio ?? undefined,
        avatarUrl: b.avatarUrl ?? undefined
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        email: true,
        emailVerifiedAt: true
      }
    });
    return ok({ user: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Bad request", 400);
  }
}
