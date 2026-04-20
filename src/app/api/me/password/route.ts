import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({
  current: z.string().min(1),
  next: z.string().min(8).max(200)
});

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  try {
    const b = Body.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: me.id } });
    if (!user) return fail("Unauthorized", 401);
    const okPw = await verifyPassword(b.current, user.passwordHash);
    if (!okPw) return fail("Current password is incorrect", 400);
    await prisma.user.update({
      where: { id: me.id },
      data: { passwordHash: await hashPassword(b.next) }
    });
    return ok({ updated: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Bad request", 400);
  }
}
