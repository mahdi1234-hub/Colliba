"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

function VerifyInner() {
  const search = useSearchParams();
  const token = search?.get("token");
  const [state, setState] = useState<"loading" | "success" | "error" | "idle">(token ? "loading" : "idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token })
        });
        const j = await res.json();
        if (!res.ok || !j.ok) {
          setState("error");
          setMessage(j.error ?? "Verification failed");
        } else {
          setState("success");
        }
      } catch {
        setState("error");
        setMessage("Network error");
      }
    })();
  }, [token]);

  return (
    <AuthShell
      eyebrow="02 — Confirm email"
      title={state === "success" ? "Email confirmed." : "Verifying your"}
      italic={state === "success" ? undefined : "account."}
      sub={
        state === "success"
          ? "Thanks for confirming. You're all set."
          : state === "error"
          ? "We couldn't confirm this link."
          : token
          ? "One moment."
          : "Open the link we sent you to confirm your email."
      }
      footer={
        <Link href="/feed" className="link">
          Continue to the feed →
        </Link>
      }
    >
      {state === "loading" && <p className="text-[13px] text-muted dot-loader" />}
      {state === "error" && <p className="text-[13px] text-[#a33]">{message}</p>}
      {state === "idle" && (
        <p className="text-[13px] text-muted">
          Didn't get the email? Sign in and request a new verification link from your account
          settings.
        </p>
      )}
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[13px] text-muted">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
