import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default async function LandingPage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule bg-parchment">
        <div className="atmospheric-wash" />
        <div className="relative mx-auto grid max-w-[1380px] grid-cols-1 gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.34fr_1fr] lg:gap-16 lg:px-14 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-quiet sm:text-[11px]">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
              Open-source architecture
            </div>
            <p className="max-w-[16rem] text-[13px] font-light leading-7 text-subtle">
              A quieter framework for shaping real-time video — proportion, atmosphere, material precision.
            </p>
          </div>
          <div>
            <h1 className="font-serif text-[2.4rem] tracking-[-0.04em] leading-[0.94] text-ink sm:text-[3.2rem] md:text-[3.9rem] lg:text-[4.4rem] xl:text-[5rem]">
              Real-time video,
              <span className="block italic text-accent">composed with restraint.</span>
            </h1>
            <p className="mt-6 max-w-[42rem] text-[15px] font-light leading-8 text-muted sm:text-[16px]">
              Colliba is an open-source real-time video platform. Biometric engagement, hybrid
              recommendations, live streaming, and creator analytics — built on a composed
              architecture you can read end to end.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-accent">
                Create an account
              </Link>
              <Link href="/feed" className="btn-ghost">
                Explore the feed
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="relative overflow-hidden border-b border-rule bg-[#f4f0e9]">
        <div className="atmospheric-wash" />
        <div className="relative mx-auto max-w-[1380px] px-5 py-20 sm:px-8 lg:px-14 lg:py-24">
          <div className="mb-14 grid items-end gap-10 lg:mb-16 lg:grid-cols-[0.34fr_1fr] lg:gap-16">
            <div>
              <div className="eyebrow mb-6 inline-flex items-center gap-3">
                <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
                Methodology
              </div>
              <p className="max-w-[15rem] text-[13px] font-light leading-7 text-subtle">
                Four disciplines guide every surface of the product — from ingest to recommendation.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-[2rem] leading-[0.94] tracking-[-0.04em] text-ink sm:text-[2.8rem] md:text-[3.5rem] xl:text-[4rem]">
                A <span className="italic text-accent">composed</span>{" "}
                stack for real-time <span className="italic text-accent">video</span>.
              </h2>
              <p className="mt-6 max-w-[42rem] text-[15px] font-light leading-8 text-muted sm:text-[16px]">
                Colliba borrows architectural discipline from a reference open-source design — service
                boundaries, event streams, and a calm, legible creator surface.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
            {[
              {
                n: "01 — Spatial Strategy",
                h: "Planning flow before form.",
                b: "Service boundaries are drawn before a pixel is shaped — ingest, recommend, stream, observe. The platform is always legible, never cluttered."
              },
              {
                n: "02 — Material Curation",
                h: "Building warmth through restraint.",
                b: "A palette of oak, plaster, and jade green. Instrument Serif and Plus Jakarta Sans. Layouts that breathe — for both creator and viewer."
              },
              {
                n: "03 — Atmosphere Direction",
                h: "Composing how a feed feels.",
                b: "Biometric engagement and a Thompson-sampling bandit tune the atmosphere of each session — stillness, rhythm, surprise."
              }
            ].map((c, i) => (
              <div key={i} className="group">
                <div className="card relative min-h-[260px] overflow-hidden sm:min-h-[320px] lg:min-h-[400px]">
                  <div className="absolute inset-4 border border-white/40 transition-all duration-500 group-hover:border-white/60 sm:inset-5" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#efe7d9] via-[#e4dcce] to-[#d7cdbd]" />
                  <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-[rgba(243,239,232,0.75)] text-accent backdrop-blur-sm">
                    <span className="font-serif text-[16px]">0{i + 1}</span>
                  </div>
                </div>
                <div className="rule pt-5">
                  <p className="eyebrow mb-2">{c.n}</p>
                  <h3 className="font-serif text-[1.55rem] leading-[1] tracking-[-0.03em] text-ink transition-colors duration-300 group-hover:text-accent">
                    {c.h}
                  </h3>
                  <p className="mt-4 text-[14px] font-light leading-7 text-muted">{c.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-b border-rule bg-[#efe9df]">
        <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-8 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[0.34fr_1fr] lg:gap-16">
            <div>
              <div className="eyebrow mb-6">The system</div>
              <p className="max-w-[16rem] text-[13px] font-light leading-7 text-subtle">
                What the platform covers, end to end — the same services described in the reference
                documentation, composed into one Vercel-deployable monorepo.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["API gateway", "Single, authenticated entry point."],
                ["Activity service", "Behavioral signals stream to Postgres events."],
                ["Biometric engagement", "face-api.js on-device; scored aggregates on server."],
                ["Recommendation", "Hybrid: popularity, co-view, content, semantic, bandit."],
                ["RL bandit", "Thompson sampling over tag and creator arms."],
                ["Streaming", "Mux for upload, HLS, and live — no servers to run."],
                ["Notification", "PartyKit fan-out for comments, likes, presence."],
                ["Search", "Postgres full-text + deterministic 128-d embeddings."],
                ["Creator studio", "Upload, schedule, analyze — one quiet surface."]
              ].map(([t, d]) => (
                <div key={t} className="border-t border-rule pt-5">
                  <p className="eyebrow mb-2">{t}</p>
                  <p className="text-[13px] font-light leading-6 text-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
