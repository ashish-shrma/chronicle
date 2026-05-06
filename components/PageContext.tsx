"use client";

import { useEffect } from "react";
import { setPageContext, triggerView } from "../lib/target";

type Props = {
  type: "home" | "category" | "article";
  category?: string | null;
  articleId?: string | null;
  article?: {
    id: string;
    title: string;
    category: string;
    source: string;
    publishedAt: string;
    readTimeMinutes: number;
    tags: string[];
  };
  viewName: string;
};

export default function PageContext({
  type,
  category = null,
  articleId = null,
  article,
  viewName
}: Props) {
  useEffect(() => {
    setPageContext({ type, category, articleId }, article);
    triggerView(viewName);
  }, [type, category, articleId, viewName, article]);

  return null;
}
