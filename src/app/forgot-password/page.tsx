"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email })
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="03 — Reset password"
      title={sent ? "Check your inbox." : "Forgot your"}
      italic={sent ? undefined : "password?"}
      sub={
        sent
          ? "If an account exists for that email, we've sent a reset link. It expires in an hour."
          : "We'll email a link to reset your password. The link is valid for one hour."
      }
      footer={
        <Link href="/login" className="link">
          Back to sign in
        </Link>
      }
    >
      {!sent && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="eyebrow mb-2 block">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-accent w-full disabled:opacity-60">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
