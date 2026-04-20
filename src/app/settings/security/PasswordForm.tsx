"use client";

import { useState } from "react";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ current, next })
      });
      const j = await res.json();
      if (!j.ok) {
        setErr(j.error ?? "Could not update");
        return;
      }
      setMsg("Password updated.");
      setCurrent("");
      setNext("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Current password</span>
        <input type="password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </label>
      <label className="mb-6 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">New password (min 8)</span>
        <input type="password" className="input" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
      </label>
      {err && <p className="mb-4 text-[12px] text-[#a33]">{err}</p>}
      {msg && <p className="mb-4 text-[12px] text-accent">{msg}</p>}
      <button className="btn-accent" disabled={loading} type="submit">
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
