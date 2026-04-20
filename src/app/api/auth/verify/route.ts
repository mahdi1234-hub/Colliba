import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { token } = (await req.json()) as { token?: string };
    if (!token) return fail("Missing token");
    const record = await prisma.emailToken.findUnique({
      where: { tokenHash: hashToken(token) }
    });
    if (!record || record.purpose !== "verify_email") return fail("Invalid token", 400);
    if (record.usedAt) return fail("Token already used", 400);
    if (record.expiresAt < new Date()) return fail("Token expired", 400);
    await prisma.$transaction([
      prisma.emailToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } })
    ]);
    return ok({ verified: true });
  } catch {
    return fail("Verification failed", 500);
  }
}
