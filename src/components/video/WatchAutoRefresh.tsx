"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Auto-refresh the watch page every 6s while the author is previewing
 * a non-READY video. Stops once the page is unmounted.
 */
export function WatchAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 6000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
