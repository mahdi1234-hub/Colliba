import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  const sessions = await prisma.authSession.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, userAgent: true, ip: true, createdAt: true, expiresAt: true }
  });
  return ok({ sessions });
}

export async function DELETE(req: Request) {
  const me = await getCurrentUser();
  if (!me) return fail("Unauthorized", 401);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id === "all") {
    await prisma.authSession.deleteMany({ where: { userId: me.id } });
    return ok({ revoked: "all" });
  }
  if (!id) return fail("Missing id", 400);
  const s = await prisma.authSession.findFirst({ where: { id, userId: me.id } });
  if (!s) return fail("Not found", 404);
  await prisma.authSession.delete({ where: { id: s.id } });
  return ok({ revoked: id });
}
