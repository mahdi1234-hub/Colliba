"use client";

import { useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; username: string; name: string | null; avatarUrl: string | null };
};

type Me = { id: string; username: string; name: string | null } | null;

export function CommentsPanel({
  videoId,
  me,
  partyHost
}: {
  videoId: string;
  me: Me;
  partyHost: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [presence, setPresence] = useState(1);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/comments/${videoId}`);
        const j = await res.json();
        setComments(j?.data?.comments ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [videoId]);

  useEffect(() => {
    if (!partyHost) return;
    const socket = new PartySocket({
      host: partyHost,
      room: videoId,
      party: "video",
      id: me?.id,
      query: me
        ? { userId: me.id, username: me.username, name: me.name ?? me.username }
        : { guest: "1" }
    });
    socketRef.current = socket;
    socket.addEventListener("message", (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "comment") {
          setComments((cs) => [msg.comment as Comment, ...cs]);
        } else if (msg.type === "presence") {
          setPresence(msg.count ?? 1);
        }
      } catch {
        /* ignore */
      }
    });
    return () => {
      socket.close();
    };
  }, [videoId, partyHost, me?.id, me?.name, me?.username]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      const res = await fetch(`/api/comments/${videoId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body })
      });
      const j = await res.json();
      if (j?.ok && j?.data?.comment) {
        setComments((cs) => [j.data.comment as Comment, ...cs]);
        socketRef.current?.send(JSON.stringify({ type: "comment", comment: j.data.comment }));
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <aside className="border border-rule bg-[#efe9df]">
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <p className="eyebrow">Live discussion</p>
        <span className="flex items-center gap-2 text-[12px] text-subtle">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
          {presence} here
        </span>
      </div>

      {me ? (
        <form onSubmit={submit} className="border-b border-rule p-4">
          <textarea
            className="input"
            placeholder="Share a thought — it'll appear live for anyone watching."
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button type="submit" className="btn-accent text-[11px]" disabled={!text.trim()}>
              Post comment
            </button>
          </div>
        </form>
      ) : (
        <div className="border-b border-rule p-4 text-[12px] text-subtle">
          Sign in to join the discussion.
        </div>
      )}

      <div className="max-h-[520px] overflow-y-auto">
        {loading && <p className="p-5 text-[12px] text-subtle dot-loader" />}
        {!loading && comments.length === 0 && (
          <p className="p-5 text-[12px] text-subtle">No comments yet. Be the first.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="border-b border-rule/60 px-5 py-4">
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="text-ink">{c.author.name ?? `@${c.author.username}`}</span>
              <span className="text-quiet">{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <p className="text-[13px] font-light leading-6 text-muted whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
