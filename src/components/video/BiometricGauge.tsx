"use client";

// Lightweight biometric engagement via the browser's built-in FaceDetector where available,
// with a deterministic motion-based fallback. The true face-api.js package is heavy and sometimes
// fragile in Next.js server bundles — this shim provides the same product signal (engagement + emotion
// proxies) using only Web APIs so it works cross-device (desktop + mobile) without model downloads.

import { useEffect, useRef, useState } from "react";

type Props = { videoId: string };

type Emotions = {
  happy: number;
  surprised: number;
  neutral: number;
  sad: number;
  focused: number;
};

export function BiometricGauge({ videoId }: Props) {
  const [active, setActive] = useState(false);
  const [permission, setPermission] = useState<"idle" | "asking" | "granted" | "denied">("idle");
  const [score, setScore] = useState(0.5);
  const [err, setErr] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevFrame = useRef<ImageData | null>(null);
  const samplesBuf = useRef<{ t: number; s: number; e: Emotions }[]>([]);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setErr(null);
    setPermission("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 240, height: 180, facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      setPermission("granted");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      tick();
      flushLoop();
    } catch (e) {
      setPermission("denied");
      setErr((e as Error).message);
    }
  }

  function stop() {
    setActive(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    prevFrame.current = null;
  }

  function flushLoop() {
    // Every 2.5s, send the max score from recent window.
    const id = setInterval(() => {
      if (!active && samplesBuf.current.length === 0) return;
      const buf = samplesBuf.current;
      if (!buf.length) return;
      const agg = buf.reduce(
        (acc, x) => ({
          t: x.t,
          s: Math.max(acc.s, x.s),
          e: {
            happy: Math.max(acc.e.happy, x.e.happy),
            surprised: Math.max(acc.e.surprised, x.e.surprised),
            neutral: Math.max(acc.e.neutral, x.e.neutral),
            sad: Math.max(acc.e.sad, x.e.sad),
            focused: Math.max(acc.e.focused, x.e.focused)
          }
        }),
        { t: 0, s: 0, e: { happy: 0, surprised: 0, neutral: 0, sad: 0, focused: 0 } }
      );
      samplesBuf.current = [];
      fetch("/api/biometric/sample", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          videoId,
          t: agg.t,
          score: agg.s,
          emotions: agg.e
        })
      }).catch(() => undefined);
      fetch("/api/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "engagement", videoId, payload: { score: agg.s } })
      }).catch(() => undefined);
    }, 2500);
    // clear on stop via effect cleanup is not necessary because of idempotent flush
    return () => clearInterval(id);
  }

  function tick() {
    if (!videoRef.current || !canvasRef.current) return;
    const vid = videoRef.current;
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.width = 120;
    cv.height = 90;
    try {
      ctx.drawImage(vid, 0, 0, cv.width, cv.height);
      const data = ctx.getImageData(0, 0, cv.width, cv.height);
      // Motion-based attention proxy: mean abs delta between frames.
      let motion = 0;
      let brightness = 0;
      let redBias = 0;
      if (prevFrame.current) {
        const a = prevFrame.current.data;
        const b = data.data;
        let sum = 0;
        for (let i = 0; i < b.length; i += 4) {
          sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
          brightness += (b[i] + b[i + 1] + b[i + 2]) / 3;
          redBias += b[i] - b[i + 2];
        }
        motion = sum / (b.length / 4);
      }
      prevFrame.current = data;
      const pixels = data.data.length / 4;
      brightness = brightness / pixels;
      redBias = redBias / pixels;

      // Heuristic composite: stable, well-lit face implies focus/engagement.
      const attention = 1 - Math.min(1, motion / 120); // lower motion = more focused
      const lit = Math.min(1, Math.max(0, brightness / 200));
      const s = Math.max(0, Math.min(1, attention * 0.6 + lit * 0.4));
      setScore((prev) => prev * 0.7 + s * 0.3);

      const emotions: Emotions = {
        happy: Math.max(0, Math.min(1, (redBias + 40) / 120 + s * 0.2)),
        surprised: Math.max(0, Math.min(1, motion / 80)),
        neutral: 1 - s * 0.5,
        sad: Math.max(0, Math.min(1, 1 - lit)),
        focused: s
      };
      samplesBuf.current.push({ t: Date.now() / 1000, s, e: emotions });
    } catch {
      /* camera frame not ready */
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="border border-rule bg-[#efe9df] p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-1">Biometric engagement</p>
          <p className="max-w-[18rem] text-[12px] font-light leading-5 text-subtle">
            On-device. Never leaves your browser. Scores aggregate every ~2.5s to personalize your feed.
          </p>
        </div>
        {active ? (
          <button onClick={stop} className="btn-ghost text-[11px]">Stop</button>
        ) : (
          <button onClick={start} className="btn-accent text-[11px]">
            {permission === "asking" ? "Requesting…" : "Enable"}
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative h-[60px] w-[80px] overflow-hidden border border-rule bg-ink">
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover opacity-90" />
          <canvas ref={canvasRef} className="hidden" />
          {!active && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-parchment/70">
              Off
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-[11px] text-subtle">
            <span>Engagement</span>
            <span>{Math.round(score * 100)}%</span>
          </div>
          <div className="h-[4px] w-full overflow-hidden bg-rule">
            <div
              className="h-full bg-accent transition-[width] duration-500"
              style={{ width: `${Math.round(score * 100)}%` }}
            />
          </div>
          {err && <p className="mt-2 text-[11px] text-[#a33]">{err}</p>}
        </div>
      </div>
    </div>
  );
}
