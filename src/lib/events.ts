import { prisma } from "./prisma";

export type EventKind =
  | "view_start"
  | "view_progress"
  | "view_complete"
  | "like"
  | "unlike"
  | "comment"
  | "share"
  | "follow"
  | "unfollow"
  | "search"
  | "live_join"
  | "live_leave"
  | "impression"
  | "click"
  | "engagement";

export async function emit(opts: {
  kind: EventKind;
  userId?: string | null;
  videoId?: string | null;
  payload?: Record<string, unknown>;
}) {
  try {
    await prisma.event.create({
      data: {
        kind: opts.kind,
        userId: opts.userId ?? null,
        videoId: opts.videoId ?? null,
        payload: (opts.payload ?? {}) as object
      }
    });
  } catch {
    /* events must never break the request */
  }
}
