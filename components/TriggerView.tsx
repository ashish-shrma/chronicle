"use client";

import { useEffect } from "react";
import { triggerView } from "../lib/target";

export default function TriggerView({ viewName }: { viewName: string }) {
  useEffect(() => {
    triggerView(viewName);
  }, [viewName]);
  return null;
}
