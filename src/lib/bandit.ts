// Thompson-sampling contextual bandit for ranking.
// Arms are identified by string keys ("tag:music", "creator:<id>"). Each arm tracks
// (alpha, beta) — Beta distribution parameters updated online from observed rewards.

import { prisma } from "./prisma";

function sampleGamma(shape: number): number {
  // Marsaglia-Tsang method for shape >= 1.
  if (shape < 1) return sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x: number;
    let v: number;
    do {
      x = gaussian();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function sampleBeta(alpha: number, beta: number): number {
  const x = sampleGamma(alpha);
  const y = sampleGamma(beta);
  return x / (x + y);
}

export async function scoreArms(userId: string, armKeys: string[]): Promise<Record<string, number>> {
  const arms = await prisma.banditState.findMany({
    where: { userId, armKey: { in: armKeys } }
  });
  const byKey = new Map(arms.map((a) => [a.armKey, a]));
  const out: Record<string, number> = {};
  for (const k of armKeys) {
    const a = byKey.get(k);
    out[k] = sampleBeta(a?.alpha ?? 1, a?.beta ?? 1);
  }
  return out;
}

export async function updateArm(userId: string, armKey: string, reward: number) {
  const r = Math.max(0, Math.min(1, reward));
  await prisma.banditState.upsert({
    where: { userId_armKey: { userId, armKey } },
    create: { userId, armKey, alpha: 1 + r, beta: 1 + (1 - r) },
    update: { alpha: { increment: r }, beta: { increment: 1 - r } }
  });
}
