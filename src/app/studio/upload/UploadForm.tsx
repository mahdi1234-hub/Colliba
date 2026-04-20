"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "creating" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Pick a video file first.");
      return;
    }
    setError(null);
    setStatus("creating");
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 16);
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description, tags: tagList })
      });
      const j = await res.json();
      if (!j.ok) {
        setStatus("error");
        setError(j.error ?? "Could not start upload.");
        return;
      }
      const { uploadUrl, videoId: vid } = j.data as { uploadUrl: string; videoId: string };
      setVideoId(vid);
      setStatus("uploading");
      await putWithProgress(uploadUrl, file, (p) => setProgress(p));
      setStatus("done");
      setTimeout(() => router.push("/studio/library"), 1200);
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Title</span>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A quiet study of afternoon light"
          required
          maxLength={140}
        />
      </label>
      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Description</span>
        <textarea
          className="input"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Set the tone — a few lines are enough."
        />
      </label>
      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Tags (comma-separated)</span>
        <input
          className="input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="design, process, interview"
        />
      </label>
      <label className="mb-6 block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-subtle">Video file</span>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-[13px] text-muted file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-[12px] file:uppercase file:tracking-[0.14em] file:text-parchment"
          required
        />
      </label>

      {status === "uploading" && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-[11px] text-subtle">
            <span>Uploading to Mux</span>
            <span>{progress}%</span>
          </div>
          <div className="h-[4px] overflow-hidden bg-rule">
            <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === "done" && videoId && (
        <div className="mb-4 border border-accent/30 bg-accent/5 p-4 text-[12px] text-muted">
          Upload complete. Mux is transcoding — you'll find it in your library shortly.
        </div>
      )}

      {error && (
        <p className="mb-4 text-[12px] text-[#a33]">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button type="submit" disabled={status === "creating" || status === "uploading"} className="btn-accent">
          {status === "creating" ? "Preparing…" : status === "uploading" ? "Uploading…" : "Publish"}
        </button>
      </div>
    </form>
  );
}

function putWithProgress(url: string, file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}
