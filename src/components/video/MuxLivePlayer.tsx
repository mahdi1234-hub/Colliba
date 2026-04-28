"use client";

import MuxPlayer from "@mux/mux-player-react";

export function MuxLivePlayer({ playbackId, title }: { playbackId: string; title: string }) {
  return (
    <MuxPlayer
      streamType="live"
      playbackId={playbackId}
      metadata={{ video_title: title }}
      accentColor="#2F5D50"
      style={{ aspectRatio: "16 / 9", background: "#181512", width: "100%" }}
    />
  );
}
