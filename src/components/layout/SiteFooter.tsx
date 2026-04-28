import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-[#efe9df]">
      <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-10 px-5 py-14 sm:px-8 lg:px-14 md:grid-cols-[0.34fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-[7px] w-[7px] rounded-full bg-accent" />
            <span className="font-serif text-[22px] text-ink">Colliba</span>
          </div>
          <p className="mt-5 max-w-[18rem] text-[13px] font-light leading-7 text-subtle">
            Real-time video, composed with proportion, atmosphere, and a quieter hand.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <div className="eyebrow mb-4">Platform</div>
            <ul className="space-y-2 text-[13px] text-muted">
              <li><Link href="/feed" className="hover:text-ink">Feed</Link></li>
              <li><Link href="/live" className="hover:text-ink">Live</Link></li>
              <li><Link href="/search" className="hover:text-ink">Search</Link></li>
              <li><Link href="/studio" className="hover:text-ink">Studio</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">Engine</div>
            <ul className="space-y-2 text-[13px] text-muted">
              <li>Hybrid recommender</li>
              <li>Biometric engagement</li>
              <li>Bandit ranking</li>
              <li>Event stream</li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">Account</div>
            <ul className="space-y-2 text-[13px] text-muted">
              <li><Link href="/login" className="hover:text-ink">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-ink">Create account</Link></li>
              <li><Link href="/forgot-password" className="hover:text-ink">Reset password</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">About</div>
            <p className="text-[13px] leading-6 text-muted">
              Built as a reference implementation of an open-source real-time video architecture.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 text-[11px] text-quiet sm:px-8 lg:px-14">
          <span>© {new Date().getFullYear()} Colliba</span>
          <span>Composed with restraint.</span>
        </div>
      </div>
    </footer>
  );
}
