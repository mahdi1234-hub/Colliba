"use client";

import Link from "next/link";
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

type Creator = {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  _count: { videos: number; followers: number };
};

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [q, setQ] = useState(initialQuery);
  const [videos, setVideos] = useState<Video[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setVideos([]);
      setCreators([]);
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const j = await res.json();
        setVideos(j?.data?.videos ?? []);
        setCreators(j?.data?.creators ?? []);
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

  const empty = !loading && q && videos.length === 0 && creators.length === 0;

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
      {empty && <p className="text-[13px] text-muted">No results for &ldquo;{q}&rdquo;.</p>}

      {creators.length > 0 && (
        <section className="mb-10">
          <div className="eyebrow mb-3">Creators</div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/u/${c.username}`}
                  className="flex items-center gap-4 border border-rule bg-[#efe9df] p-4 transition-colors hover:bg-parchment2"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-rule bg-ink">
                    {c.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatarUrl} alt={c.username} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-serif text-[18px] text-parchment">
                        {(c.name ?? c.username).slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[1.1rem] tracking-[-0.02em] text-ink">
                      {c.name ?? c.username}
                    </p>
                    <p className="truncate text-[12px] text-muted">
                      @{c.username} · {c._count.videos} videos · {c._count.followers} followers
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <div className="eyebrow mb-3">Videos</div>
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
        </section>
      )}
    </div>
  );
}
