"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SessionRow({
  id,
  userAgent,
  ip,
  createdAt,
  expiresAt
}: {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  expiresAt: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function revoke() {
    setLoading(true);
    try {
      await fetch(`/api/me/sessions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-[12px]">
      <div className="min-w-[200px] flex-1">
        <p className="text-ink">{userAgent ?? "Unknown device"}</p>
        <p className="text-quiet">
          {ip ?? "—"} · Signed in {new Date(createdAt).toLocaleString()} · Expires {new Date(expiresAt).toLocaleDateString()}
        </p>
      </div>
      <button onClick={revoke} disabled={loading} className="btn-ghost text-[11px]">
        {loading ? "…" : "Revoke"}
      </button>
    </div>
  );
}
