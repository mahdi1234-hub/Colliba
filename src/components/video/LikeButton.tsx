"use client";

import { useState } from "react";

export function LikeButton({ videoId, initial }: { videoId: string; initial?: boolean }) {
  const [liked, setLiked] = useState(!!initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/likes/${videoId}`, { method: "POST" });
      const j = await res.json();
      if (j?.ok) setLiked(!!j.data.liked);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className="btn-ghost flex items-center gap-2 text-[12px]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "#2F5D50" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {liked ? "Liked" : "Like"}
    </button>
  );
}
