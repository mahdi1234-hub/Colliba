import Link from "next/link";

export function AuthShell({
  eyebrow,
  title,
  italic,
  sub,
  children,
  footer
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  sub: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-parchment">
      <div className="atmospheric-wash absolute inset-0" />
      <div className="relative mx-auto grid min-h-screen max-w-[1380px] grid-cols-1 lg:grid-cols-[0.44fr_1fr]">
        <aside className="hidden border-r border-rule px-10 py-14 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="h-[7px] w-[7px] rounded-full bg-accent" />
            <span className="font-serif text-[22px] tracking-tight text-ink">Colliba</span>
          </Link>
          <div className="max-w-[20rem]">
            <p className="eyebrow mb-6">An open-source atelier</p>
            <p className="font-serif text-[2.2rem] leading-[0.98] tracking-[-0.04em] text-ink">
              Real-time video,
              <span className="block italic text-accent">composed with restraint.</span>
            </p>
            <p className="mt-6 text-[13px] font-light leading-7 text-subtle">
              Biometric engagement, hybrid recommendations, live streaming — one quiet surface for
              creators and audiences.
            </p>
          </div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-quiet">
            © {new Date().getFullYear()} Colliba
          </p>
        </aside>

        <section className="flex items-start justify-center px-5 py-12 sm:px-8 lg:items-center lg:px-14">
          <div className="w-full max-w-[460px]">
            <Link href="/" className="mb-10 inline-flex items-center gap-3 lg:hidden">
              <span className="h-[7px] w-[7px] rounded-full bg-accent" />
              <span className="font-serif text-[20px] tracking-tight text-ink">Colliba</span>
            </Link>

            <p className="eyebrow mb-4">{eyebrow}</p>
            <h1 className="font-serif text-[2.2rem] leading-[0.98] tracking-[-0.04em] text-ink sm:text-[2.8rem]">
              {title}
              {italic ? <span className="block italic text-accent">{italic}</span> : null}
            </h1>
            <p className="mt-4 max-w-[30rem] text-[14px] font-light leading-7 text-muted">{sub}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 text-[13px] text-subtle">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
