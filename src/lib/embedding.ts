// Lightweight deterministic embedding (128-d hashing trick) so search + semantic
// similarity work without an external embeddings API.
// Sufficient for demo-scale; swap for an LLM/sentence-transformers service in prod.

const DIM = 128;

function hash(str: string, seed = 0): number {
  let h = seed ^ 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

export function embed(text: string): number[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && t.length < 32);
  const vec = new Array<number>(DIM).fill(0);
  for (const t of tokens) {
    const idx = hash(t) % DIM;
    const sign = hash(t, 1) % 2 === 0 ? 1 : -1;
    vec[idx] += sign;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function cosine(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
