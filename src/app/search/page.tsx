import { AppLayout } from "@/components/layout/AppLayout";
import { SearchClient } from "./SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-14">
        <div className="eyebrow mb-4 inline-flex items-center gap-3">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          Search
        </div>
        <h1 className="mb-8 font-serif text-[2rem] leading-[1] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          Find what you're <span className="italic text-accent">looking for.</span>
        </h1>
        <SearchClient initialQuery={searchParams.q ?? ""} />
      </div>
    </AppLayout>
  );
}
