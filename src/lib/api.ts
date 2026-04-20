import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...(extra ?? {}) }, { status });
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  try {
    const raw = await req.json();
    return schema.parse(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new Response(JSON.stringify({ ok: false, error: "Invalid input", issues: e.issues }), {
        status: 422,
        headers: { "content-type": "application/json" }
      });
    }
    throw new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
}
