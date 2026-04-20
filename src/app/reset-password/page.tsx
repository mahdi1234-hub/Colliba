"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

function ResetPasswordInner() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search?.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setError(j.error ?? "Reset failed");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="04 — New password"
      title={done ? "Password updated." : "Set a new"}
      italic={done ? undefined : "password."}
      sub={
        done
          ? "Redirecting you to sign in."
          : "Choose a new password — at least 8 characters. This will sign out any existing sessions."
      }
      footer={
        <Link href="/login" className="link">
          Back to sign in
        </Link>
      }
    >
      {!done && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="eyebrow mb-2 block">New password</label>
            <input
              type="password"
              required
              minLength={8}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Confirm password</label>
            <input
              type="password"
              required
              minLength={8}
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-[13px] text-[#a33]">{error}</p>}
          <button type="submit" disabled={loading} className="btn-accent w-full disabled:opacity-60">
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[13px] text-muted">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
