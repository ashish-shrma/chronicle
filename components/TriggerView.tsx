"use client";

import { useEffect } from "react";

// Used on non-homepage pages (category, article, about).
// Homepage triggerView is owned by ReaderPicker so customer IDs are set first.
export default function TriggerView({ viewName }: { viewName: string }) {
  useEffect(() => {
    if (!window.adobe?.target?.triggerView) return;
    try {
      window.adobe.target.triggerView(viewName);
    } catch {}
  }, [viewName]);
  return null;
}
