"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") ?? "/feed";
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Login failed");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="01 — Welcome back"
      title="Step back into"
      italic="Colliba."
      sub="Sign in with your email or username."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="link">
            Create an account
          </Link>
          .
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="eyebrow mb-2 block">Email or username</label>
          <input
            type="text"
            required
            autoComplete="username"
            className="input"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="eyebrow">Password</label>
            <Link href="/forgot-password" className="text-[12px] text-muted hover:text-accent">
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            required
            autoComplete="current-password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="text-[13px] text-[#a33]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-accent w-full disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[13px] text-muted">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
