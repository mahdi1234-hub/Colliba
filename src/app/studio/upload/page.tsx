import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { UploadForm } from "./UploadForm";

export default async function UploadPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/studio/upload");
  return (
    <AppLayout>
      <div className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="eyebrow mb-4 inline-flex items-center gap-3">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          Studio · Upload
        </div>
        <h1 className="mb-6 font-serif text-[2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          Publish a new <span className="italic text-accent">video.</span>
        </h1>
        <p className="mb-8 max-w-[52ch] text-[14px] font-light leading-7 text-muted">
          Files upload directly to Mux via a signed URL, then transcoded to HLS and delivered from Mux's CDN.
          Your video appears in the feed once it's ready.
        </p>
        <UploadForm />
      </div>
    </AppLayout>
  );
}
