import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, hashToken } from "@/lib/auth";
import { ok, fail, parseJson } from "@/lib/api";

export const runtime = "nodejs";

const Body = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200)
});

export async function POST(req: Request) {
  try {
    const body = await parseJson(req, Body);
    const record = await prisma.emailToken.findUnique({
      where: { tokenHash: hashToken(body.token) }
    });
    if (!record || record.purpose !== "password_reset") return fail("Invalid token", 400);
    if (record.usedAt) return fail("Token already used", 400);
    if (record.expiresAt < new Date()) return fail("Token expired", 400);
    const passwordHash = await hashPassword(body.password);
    await prisma.$transaction([
      prisma.emailToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.authSession.deleteMany({ where: { userId: record.userId } })
    ]);
    return ok({ reset: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Reset failed", 500);
  }
}
