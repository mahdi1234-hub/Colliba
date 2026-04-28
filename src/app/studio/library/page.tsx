import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "@/components/layout/AppLayout";
import { DeleteVideoButton } from "./DeleteVideoButton";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/studio/library");

  const videos = await prisma.video.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { likes: true, comments: true } } }
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="eyebrow mb-4 inline-flex items-center gap-3">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          Studio · Library
        </div>
        <h1 className="mb-8 font-serif text-[2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          Your <span className="italic text-accent">library.</span>
        </h1>

        {videos.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="eyebrow mb-3">Empty</p>
            <p className="mb-6 text-[14px] font-light leading-7 text-muted">
              You haven't published anything yet.
            </p>
            <Link href="/studio/upload" className="btn-accent inline-block">Upload your first video</Link>
          </div>
        ) : (
          <div className="divide-y divide-rule border border-rule bg-[#efe9df]">
            {videos.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="h-[64px] w-[108px] flex-shrink-0 border border-rule bg-ink">
                  {v.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnailUrl} alt={v.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-parchment/70">
                      {v.status}
                    </div>
                  )}
                </div>
                <div className="min-w-[200px] flex-1">
                  <p className="eyebrow mb-1">{v.status}</p>
                  <h3 className="font-serif text-[1.2rem] tracking-[-0.03em] text-ink">{v.title}</h3>
                  <p className="mt-1 text-[12px] text-muted">
                    {v.views} views · {v._count.likes} ♥ · {v._count.comments} 💬
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/watch/${v.id}`} className="btn-ghost text-[11px]">
                    {v.status === "READY" ? "View" : "Preview"}
                  </Link>
                  <DeleteVideoButton id={v.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
