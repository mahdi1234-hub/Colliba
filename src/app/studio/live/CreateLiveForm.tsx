"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateLiveForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/live", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description })
      });
      const j = await res.json();
      if (!j.ok) {
        setError(j.error ?? "Could not create room.");
        return;
      }
      router.push(`/live/${j.data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6">
      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Room title</span>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={140} placeholder="Studio notes, live" />
      </label>
      <label className="mb-6 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Description</span>
        <textarea className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What viewers will hear and see." />
      </label>
      {error && <p className="mb-4 text-[12px] text-[#a33]">{error}</p>}
      <button className="btn-accent" disabled={loading} type="submit">
        {loading ? "Creating…" : "Generate RTMP + room"}
      </button>
    </form>
  );
}
