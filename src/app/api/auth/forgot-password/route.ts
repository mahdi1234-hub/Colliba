import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mail";
import { ok, parseJson } from "@/lib/api";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email().transform((s) => s.trim().toLowerCase())
});

export async function POST(req: Request) {
  try {
    const body = await parseJson(req, Body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (user) {
      const token = generateToken(24);
      await prisma.emailToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          purpose: "password_reset",
          expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        }
      });
      try {
        await sendPasswordResetEmail(user.email, `${env.APP_URL}/reset-password?token=${token}`);
      } catch {
        /* swallow mail errors to avoid leaking account existence */
      }
    }
    // Always respond 200 to avoid user enumeration
    return ok({ sent: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return ok({ sent: true });
  }
}
