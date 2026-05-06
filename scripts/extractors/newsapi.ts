import axios from "axios";

export interface NewsApiArticle {
  source: string;
  category: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  author: string | null;
}

const CATEGORIES = ["technology", "business", "science", "sports"];

const CAT_MAP: Record<string, string> = {
  technology: "tech",
  business: "business",
  science: "science",
  sports: "sports"
};

export async function fetchNewsApi(apiKey: string | undefined): Promise<NewsApiArticle[]> {
  if (!apiKey) {
    console.warn("[newsapi] no API key — skipping");
    return [];
  }

  const out: NewsApiArticle[] = [];
  for (const c of CATEGORIES) {
    try {
      const res = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: { category: c, language: "en", pageSize: 8 },
        headers: { "X-Api-Key": apiKey },
        timeout: 8000
      });
      for (const a of res.data.articles || []) {
        if (!a.url || !a.title) continue;
        out.push({
          source: a.source?.name || "NewsAPI",
          category: CAT_MAP[c] || "world",
          title: a.title,
          description: a.description || "",
          url: a.url,
          urlToImage: a.urlToImage || null,
          publishedAt: a.publishedAt || new Date().toISOString(),
          author: a.author || null
        });
      }
    } catch (err: any) {
      console.warn(`[newsapi] ${c} failed: ${err?.message}`);
    }
  }
  return out;
}
