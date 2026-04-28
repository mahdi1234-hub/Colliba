import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { env } from "./env";

const SESSION_COOKIE = "colliba_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const secretKey = () => new TextEncoder().encode(env.AUTH_SECRET);

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 11);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, userAgent?: string, ip?: string) {
  const raw = generateToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  await prisma.authSession.create({
    data: { userId, tokenHash, userAgent, ip, expiresAt }
  });
  const jwt = await new SignJWT({ uid: userId, sid: tokenHash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt.getTime() / 1000)
    .sign(secretKey());
  cookies().set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
  return { tokenHash, expiresAt };
}

export async function destroySession() {
  const jar = cookies();
  const cookie = jar.get(SESSION_COOKIE);
  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie.value, secretKey());
      const sid = (payload as { sid?: string }).sid;
      if (sid) await prisma.authSession.deleteMany({ where: { tokenHash: sid } });
    } catch {
      /* ignore */
    }
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookie = cookies().get(SESSION_COOKIE);
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie.value, secretKey());
    const uid = (payload as { uid?: string }).uid;
    const sid = (payload as { sid?: string }).sid;
    if (!uid || !sid) return null;
    const session = await prisma.authSession.findUnique({ where: { tokenHash: sid } });
    if (!session || session.expiresAt < new Date() || session.userId !== uid) return null;
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        emailVerifiedAt: true,
        createdAt: true
      }
    });
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Response("Unauthorized", { status: 401 });
  return u;
}
