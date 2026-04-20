"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Me = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileForm({ me }: { me: Me }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: me.name ?? "",
    username: me.username,
    bio: me.bio ?? "",
    avatarUrl: me.avatarUrl ?? ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const body: Partial<Me> = {
        name: form.name,
        username: form.username,
        bio: form.bio,
        avatarUrl: form.avatarUrl || undefined
      };
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const j = await res.json();
      if (!j.ok) {
        setError(j.error ?? "Could not save");
        return;
      }
      setMessage("Saved.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Name</span>
        <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </label>
      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Username</span>
        <input className="input" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
      </label>
      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Bio</span>
        <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} maxLength={300} />
      </label>
      <label className="mb-6 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Avatar URL</span>
        <input className="input" value={form.avatarUrl} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." />
      </label>
      {error && <p className="mb-4 text-[12px] text-[#a33]">{error}</p>}
      {message && <p className="mb-4 text-[12px] text-accent">{message}</p>}
      <button className="btn-accent" disabled={loading} type="submit">
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
