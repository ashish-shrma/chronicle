"use client";

import { useEffect } from "react";
import { track } from "../lib/analytics";

export default function ScrollDepthTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    const fired = new Set<number>();
    const thresholds = [0.25, 0.5, 0.75, 1.0];

    function onScroll() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) return;
      const pct = Math.min(1, doc.scrollTop / total);
      for (const t of thresholds) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          track("scrollDepth", { articleId, depth: t, "article.scrollDepth": t });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [articleId]);

  return null;
}
