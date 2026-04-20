import Link from "next/link";

type Author = { id: string; username: string; name: string | null; avatarUrl: string | null } | null;

export function VideoCard({
  id,
  title,
  durationSec,
  thumbnailUrl,
  tags,
  author,
  likes,
  comments,
  views,
  href
}: {
  id: string;
  title: string;
  durationSec: number | null;
  thumbnailUrl: string | null;
  tags: string[];
  author: Author;
  likes: number;
  comments: number;
  views: number;
  href?: string;
}) {
  const dur = durationSec ? fmtDuration(durationSec) : null;
  const link = href ?? `/watch/${id}`;
  return (
    <Link href={link} className="group block">
      <div className="video-cover relative border border-rule">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3a5249] to-[#1a2a24] text-parchment">
            <span className="font-serif text-[22px]">Colliba</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-4 border border-white/40 transition-all duration-500 group-hover:border-white/70 sm:inset-5" />
        {dur && (
          <div className="absolute bottom-3 right-3 bg-ink/80 px-2 py-[2px] text-[10px] tracking-wider text-parchment">
            {dur}
          </div>
        )}
      </div>
      <div className="pt-4">
        <p className="eyebrow mb-2">{tags.slice(0, 2).join(" · ") || "Video"}</p>
        <h3 className="font-serif text-[1.35rem] leading-[1.05] tracking-[-0.03em] text-ink transition-colors duration-300 group-hover:text-accent">
          {title}
        </h3>
        <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
          <span>
            {author ? author.name ?? `@${author.username}` : "Unknown"}
          </span>
          <span>
            {views} views · {likes} ♥ · {comments} 💬
          </span>
        </div>
      </div>
    </Link>
  );
}

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}
