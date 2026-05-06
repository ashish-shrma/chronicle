"use client";

type PageContext = {
  type: "home" | "category" | "article";
  category: string | null;
  articleId: string | null;
};

type ArticleContext = {
  id: string;
  title: string;
  category: string;
  source: string;
  publishedAt: string;
  readTimeMinutes: number;
  tags: string[];
};

export function setPageContext(page: PageContext, article?: ArticleContext) {
  if (typeof window === "undefined") return;
  window.chronicleData = window.chronicleData || {};
  window.chronicleData.page = page;
  if (article) {
    window.chronicleData.article = article;
  } else {
    delete window.chronicleData.article;
  }
}

export function triggerView(viewName: string) {
  if (typeof window === "undefined") return;
  if (window.adobe?.target?.triggerView) {
    try {
      window.adobe.target.triggerView(viewName);
    } catch (err) {
      console.warn("[target] triggerView failed", err);
    }
  }
}
