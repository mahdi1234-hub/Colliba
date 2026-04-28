"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef } from "react";

type Props = {
  playbackId: string;
  title?: string;
  videoId?: string;
  durationSec?: number | null;
  autoPlay?: boolean;
  onProgress?: (t: number, d: number) => void;
};

export function MuxPlayerClient({ playbackId, title, videoId, durationSec, autoPlay, onProgress }: Props) {
  const last = useRef(0);
  const started = useRef(false);
  const completed = useRef(false);

  useEffect(() => {
    if (!videoId) return;
    // view_start fire-and-forget on mount
    fetch("/api/activity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "view_start", videoId })
    }).catch(() => undefined);
  }, [videoId]);

  return (
    <MuxPlayer
      streamType="on-demand"
      playbackId={playbackId}
      metadata={{ video_title: title, video_id: videoId }}
      autoPlay={autoPlay ? "muted" : false}
      accentColor="#2F5D50"
      style={{ aspectRatio: "16 / 9", background: "#181512", width: "100%" }}
      onTimeUpdate={(e: any) => {
        const el = e.currentTarget as HTMLMediaElement;
        const t = el.currentTime;
        const d = el.duration || durationSec || 0;
        onProgress?.(t, d);
        if (videoId && d > 0 && t - last.current > 10) {
          last.current = t;
          fetch("/api/activity", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              kind: "view_progress",
              videoId,
              payload: { t, progress: Math.max(0, Math.min(1, t / d)) }
            })
          }).catch(() => undefined);
        }
        if (videoId && d > 0 && !completed.current && t / d > 0.9) {
          completed.current = true;
          fetch("/api/activity", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ kind: "view_complete", videoId })
          }).catch(() => undefined);
        }
        if (!started.current) started.current = true;
      }}
    />
  );
}
