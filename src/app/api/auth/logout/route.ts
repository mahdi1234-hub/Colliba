import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  await destroySession();
  return NextResponse.redirect(new URL("/", process.env.APP_URL ?? "http://localhost:3000"), {
    status: 303
  });
}
