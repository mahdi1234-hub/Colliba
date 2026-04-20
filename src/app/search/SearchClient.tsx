"use client";

import { useEffect, useState } from "react";
import { VideoCard } from "@/components/video/VideoCard";

type Video = {
  id: string;
  title: string;
  durationSec: number | null;
  thumbnailUrl: string | null;
  tags: string[];
  views: number;
  author: { id: string; username: string; name: string | null; avatarUrl: string | null };
  _count: { likes: number; comments: number };
};

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [q, setQ] = useState(initialQuery);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setVideos([]);
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const j = await res.json();
        setVideos(j?.data?.videos ?? []);
      } catch {
        /* abort */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q]);

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search videos, tags, creators…"
        className="input mb-8"
        autoFocus
      />
      {loading && <p className="text-[12px] text-subtle dot-loader">Searching</p>}
      {!loading && videos.length === 0 && q && (
        <p className="text-[13px] text-muted">No results for "{q}".</p>
      )}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {videos.map((v) => (
          <VideoCard
            key={v.id}
            id={v.id}
            title={v.title}
            tags={v.tags}
            durationSec={v.durationSec}
            thumbnailUrl={v.thumbnailUrl}
            author={v.author}
            likes={v._count.likes}
            comments={v._count.comments}
            views={v.views}
          />
        ))}
      </div>
    </div>
  );
}
