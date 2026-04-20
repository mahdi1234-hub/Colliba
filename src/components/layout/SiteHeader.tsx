"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Me = { id: string; username: string; name: string | null } | null;

export function SiteHeader({ me }: { me: Me }) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/feed", label: "Feed" },
    { href: "/live", label: "Live" },
    { href: "/search", label: "Search" },
    { href: "/studio", label: "Studio" }
  ];

  return (
    <header className="relative z-30 border-b border-rule bg-parchment/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 sm:px-8 lg:px-14">
        <Link href="/" className="flex items-center gap-3">
          <span className="h-[7px] w-[7px] rounded-full bg-accent" />
          <span className="font-serif text-[22px] tracking-tight text-ink">Colliba</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              data-active={pathname === n.href || pathname.startsWith(n.href + "/")}
              className="nav-link"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {me ? (
            <>
              <Link href="/studio" className="text-sm text-muted hover:text-ink">
                {me.name ?? me.username}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn-ghost" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted hover:text-ink">
                Sign in
              </Link>
              <Link href="/signup" className="btn-accent">
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-muted"
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
        >
          <span className="block h-[1px] w-6 bg-ink" />
          <span className="mt-[6px] block h-[1px] w-6 bg-ink" />
          <span className="mt-[6px] block h-[1px] w-6 bg-ink" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-rule bg-parchment">
          <div className="mx-auto flex max-w-[1380px] flex-col gap-1 px-5 py-4">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="py-2 text-sm text-muted"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {me ? (
                <form action="/api/auth/logout" method="post" className="flex-1">
                  <button className="btn-ghost w-full">Sign out</button>
                </form>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost flex-1 text-center">
                    Sign in
                  </Link>
                  <Link href="/signup" className="btn-accent flex-1 text-center">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
