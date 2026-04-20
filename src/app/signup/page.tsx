"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", name: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Signup failed");
        return;
      }
      router.push("/feed");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="01 — Create your account"
      title="Step into a composed"
      italic="real-time atelier."
      sub="Your account unlocks the feed, the studio, and live rooms."
      footer={
        <>
          Already with us?{" "}
          <Link href="/login" className="link">
            Sign in
          </Link>
          .
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="eyebrow mb-2 block">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow mb-2 block">Username</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9_]+"
              autoComplete="username"
              className="input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Display name</label>
            <input
              type="text"
              maxLength={60}
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="eyebrow mb-2 block">Password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="mt-2 text-[12px] text-subtle">At least 8 characters.</p>
        </div>
        {error && <p className="text-[13px] text-[#a33]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-accent w-full disabled:opacity-60">
          {loading ? "Composing…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
