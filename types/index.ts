export interface Article {
  id: string;
  title: string;
  summary: string;
  body: string;
  source: string;
  category: string;
  tags: string[];
  author: string | null;
  publishedAt: string;
  imageUrl: string | null;
  originalUrl: string;
  readTimeMinutes: number;
  language: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  articleCount: number;
}

export interface Reader {
  id: string;
  name: string;
  tier: "premium" | "free";
  region: string;
  topics: string;
}

export type CategorySlug =
  | "tech"
  | "world"
  | "business"
  | "science"
  | "culture"
  | "sports";

declare global {
  interface Window {
    chronicleData?: {
      page?: {
        type: "home" | "category" | "article";
        category: string | null;
        articleId: string | null;
      };
      article?: {
        id: string;
        title?: string;
        category: string;
        source: string;
        publishedAt: string;
        readTimeMinutes: number;
        tags: string[];
      };
    };
    targetPageParams?: () => Record<string, string>;
    Visitor?: {
      getInstance: (orgId: string) => {
        setCustomerIDs: (ids: Record<string, unknown>) => void;
      };
      AuthState: { AUTHENTICATED: number; LOGGED_OUT: number; UNKNOWN: number };
    };
    adobe?: {
      target?: {
        triggerView: (viewName: string, options?: { page?: boolean }) => void;
      };
    };
    _satellite?: {
      track: (event: string, payload?: Record<string, unknown>) => void;
    };
  }
}
