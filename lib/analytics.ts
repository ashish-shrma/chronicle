"use client";

export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (window._satellite?.track) {
    try {
      window._satellite.track(event, payload);
    } catch (err) {
      console.warn("[analytics] track failed", err);
    }
  }
}
