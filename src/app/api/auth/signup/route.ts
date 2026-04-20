import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, generateToken, hashPassword, hashToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { emit } from "@/lib/events";
import { ok, fail, parseJson } from "@/lib/api";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email().transform((s) => s.trim().toLowerCase()),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/i, "Letters, numbers, underscores only")
    .transform((s) => s.trim().toLowerCase()),
  name: z.string().min(1).max(60).optional(),
  password: z.string().min(8).max(200)
});

export async function POST(req: Request) {
  try {
    const body = await parseJson(req, Body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
      select: { id: true, email: true, username: true }
    });
    if (existing) {
      if (existing.email === body.email) return fail("Email is already in use");
      return fail("Username is taken");
    }
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        name: body.name ?? body.username,
        passwordHash
      }
    });
    const token = generateToken(24);
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        purpose: "verify_email",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
    const url = `${env.APP_URL}/verify?token=${token}`;
    try {
      await sendVerificationEmail(user.email, url);
    } catch {
      /* do not block signup */
    }
    await createSession(user.id);
    await emit({ kind: "follow", userId: user.id, payload: { action: "signup" } });
    return ok({ id: user.id, email: user.email, username: user.username });
  } catch (e) {
    if (e instanceof Response) return e;
    return fail("Signup failed", 500);
  }
}
