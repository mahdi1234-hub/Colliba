"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteVideoButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function del() {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/videos/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }
  return (
    <button onClick={del} disabled={loading} className="btn-ghost text-[11px] text-[#a33]">
      {loading ? "…" : "Delete"}
    </button>
  );
}
