import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "@/components/layout/AppLayout";
import { VideoCard } from "@/components/video/VideoCard";

export const dynamic = "force-dynamic";

export default async function CreatorPage({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username).toLowerCase();
  const user = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: { select: { videos: true, followers: true, follows: true } }
    }
  });
  if (!user) return notFound();

  const videos = await prisma.video.findMany({
    where: { authorId: user.id, status: "READY" },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } }
    }
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-14">
        <header className="mb-10 flex flex-col items-start gap-6 border-b border-rule pb-10 sm:flex-row sm:items-center">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border border-rule bg-ink">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-[2.4rem] text-parchment">
                {(user.name ?? user.username).slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-2">Creator</p>
            <h1 className="font-serif text-[2.4rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[3rem]">
              {user.name ?? user.username}
            </h1>
            <p className="mt-2 text-[13px] text-muted">@{user.username}</p>
            {user.bio && (
              <p className="mt-4 max-w-[60ch] text-[14px] font-light leading-7 text-muted">{user.bio}</p>
            )}
            <p className="mt-4 text-[12px] text-subtle">
              {user._count.videos} videos · {user._count.followers} followers · {user._count.follows} following
            </p>
          </div>
        </header>

        <div className="eyebrow mb-4">Videos</div>
        {videos.length === 0 ? (
          <p className="text-[13px] text-muted">No published videos yet.</p>
        ) : (
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
        )}
      </div>
    </AppLayout>
  );
}
