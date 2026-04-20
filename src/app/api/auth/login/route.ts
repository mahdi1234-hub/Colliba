import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { ok, fail, parseJson } from "@/lib/api";

export const runtime = "nodejs";

const Body = z.object({
  identifier: z.string().min(1).transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const body = await parseJson(req, Body);
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: body.identifier }, { username: body.identifier }] }
    });
    if (!user) return fail("Invalid email or password", 401);
    const okPw = await verifyPassword(body.password, user.passwordHash);
    if (!okPw) return fail("Invalid email or password", 401);
    await createSession(user.id);
    return ok({ id: user.id, email: user.email, username: user.username });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Login failed", 500);
  }
}
