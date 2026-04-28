import { prisma } from "@/lib/prisma";
import { getCurrentUser, generateToken, hashToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { ok, fail } from "@/lib/api";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST() {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  if (me.emailVerifiedAt) return ok({ already: true });
  const token = generateToken(24);
  await prisma.emailToken.create({
    data: {
      userId: me.id,
      tokenHash: hashToken(token),
      purpose: "verify_email",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
  try {
    await sendVerificationEmail(me.email, `${env.APP_URL}/verify?token=${token}`);
  } catch {
    return fail("Mail delivery failed", 500);
  }
  return ok({ sent: true });
}
