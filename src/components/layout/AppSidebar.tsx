"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type MeView = {
  id: string;
  username: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
} | null;

type Item = { href: string; label: string; icon: string };

const mainItems: Item[] = [
  { href: "/feed", label: "Feed", icon: "M3 6h18M3 12h18M3 18h12" },
  { href: "/live", label: "Live", icon: "M12 2a7 7 0 0 1 7 7c0 3-2 5.5-5 6.5V22h-4v-6.5C7 14.5 5 12 5 9a7 7 0 0 1 7-7z" },
  { href: "/search", label: "Search", icon: "M21 21l-4.35-4.35M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" }
];

const studioItems: Item[] = [
  { href: "/studio", label: "Overview", icon: "M3 4h18v12H3zM7 20h10" },
  { href: "/studio/upload", label: "Upload", icon: "M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" },
  { href: "/studio/live", label: "Live rooms", icon: "M4 6h16v12H4zM4 10h16M10 14l4 2-4 2z" },
  { href: "/studio/analytics", label: "Analytics", icon: "M4 20V10m6 10V4m6 16v-8" }
];

const accountItems: Item[] = [
  { href: "/settings/profile", label: "Profile", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" },
  { href: "/settings/security", label: "Security", icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" },
  { href: "/settings/sessions", label: "Sessions", icon: "M4 6h16v4H4zM4 14h16v4H4z" }
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Section({
  label,
  items,
  pathname,
  collapsed,
  onNavigate
}: {
  label: string;
  items: Item[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="mb-5">
      {!collapsed && <div className="eyebrow mb-2 px-3">{label}</div>}
      {collapsed && <div className="mx-3 mb-2 h-px bg-rule/70" />}
      <ul>
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/studio" && pathname.startsWith(it.href));
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={onNavigate}
                title={collapsed ? it.label : undefined}
                aria-label={it.label}
                className={`mb-[2px] flex items-center gap-3 rounded-[2px] px-3 py-2 text-[13px] transition-colors ${
                  active ? "bg-parchment2 text-ink" : "text-muted hover:bg-parchment2/60 hover:text-ink"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className={active ? "text-accent" : "text-quiet"}>
                  <Icon d={it.icon} />
                </span>
                {!collapsed && <span>{it.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AppSidebar({ me }: { me: MeView }) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const v = typeof window !== "undefined" ? localStorage.getItem("colliba:sb-collapsed") : null;
      if (v === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("colliba:sb-collapsed", collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed, mounted]);

  const content = (isCollapsed: boolean) => (
    <>
      <div className={`flex items-center justify-between pb-5 pt-5 ${isCollapsed ? "px-3" : "px-5"}`}>
        <Link
          href="/"
          className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}
          onClick={() => setOpen(false)}
          aria-label="Colliba home"
        >
          <span className="h-[8px] w-[8px] rounded-full bg-accent" />
          {!isCollapsed && <span className="font-serif text-[22px] tracking-tight text-ink">Colliba</span>}
        </Link>
        {!isCollapsed && (
          <button
            className="text-muted hover:text-ink lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto pb-6 ${isCollapsed ? "px-2" : "px-2"}`}>
        <Section label="Browse" items={mainItems} pathname={pathname} collapsed={isCollapsed} onNavigate={() => setOpen(false)} />
        <Section label="Studio" items={studioItems} pathname={pathname} collapsed={isCollapsed} onNavigate={() => setOpen(false)} />
        <Section label="Account" items={accountItems} pathname={pathname} collapsed={isCollapsed} onNavigate={() => setOpen(false)} />
      </div>

      <div className={`border-t border-rule py-3 ${isCollapsed ? "px-2" : "px-4"}`}>
        {me ? (
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[13px] font-medium text-white"
              title={isCollapsed ? `${me.name ?? me.username} (@${me.username})` : undefined}
            >
              {(me.name ?? me.username).slice(0, 1).toUpperCase()}
            </div>
            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-ink">{me.name ?? me.username}</p>
                  <p className="truncate text-[11px] text-quiet">@{me.username}</p>
                </div>
                <form action="/api/auth/logout" method="post">
                  <button
                    className="text-quiet hover:text-ink"
                    aria-label="Sign out"
                    type="submit"
                    title="Sign out"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <div className={`flex gap-2 ${isCollapsed ? "flex-col" : ""}`}>
            <Link
              href="/login"
              className={`btn-ghost text-center text-[11px] ${isCollapsed ? "px-2 py-2" : "flex-1"}`}
              title={isCollapsed ? "Sign in" : undefined}
            >
              {isCollapsed ? "In" : "Sign in"}
            </Link>
            <Link
              href="/signup"
              className={`btn-accent text-center text-[11px] ${isCollapsed ? "px-2 py-2" : "flex-1"}`}
              title={isCollapsed ? "Create account" : undefined}
            >
              {isCollapsed ? "Up" : "Create account"}
            </Link>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-rule bg-parchment/90 px-5 py-3 backdrop-blur-sm lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <span className="h-[6px] w-[6px] rounded-full bg-accent" />
          <span className="font-serif text-[18px] text-ink">Colliba</span>
        </Link>
        <button className="text-muted" aria-label="Open sidebar" onClick={() => setOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-rule bg-[#efe9df] transition-[width] duration-200 ease-out lg:flex ${
          collapsed ? "w-[68px]" : "w-[248px]"
        }`}
      >
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-6 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-rule bg-parchment text-muted shadow-sm hover:text-ink lg:flex"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: collapsed ? "rotate(180deg)" : undefined, transition: "transform 200ms" }}
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        {content(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <aside className="relative ml-auto flex h-full w-[300px] flex-col border-l border-rule bg-[#efe9df]">
            {content(false)}
          </aside>
        </div>
      )}
    </>
  );
}
