import axios from "axios";

export interface GuardianArticle {
  source: string;
  category: string;
  title: string;
  body: string;
  trailText: string;
  url: string;
  thumbnail: string | null;
  publishedAt: string;
  author: string | null;
  tags: string[];
}

const SECTIONS: Array<{ id: string; category: string }> = [
  { id: "world", category: "world" },
  { id: "technology", category: "tech" },
  { id: "business", category: "business" },
  { id: "science", category: "science" },
  { id: "culture", category: "culture" },
  { id: "sport", category: "sports" }
];

export async function fetchGuardian(apiKey: string | undefined): Promise<GuardianArticle[]> {
  if (!apiKey) {
    console.warn("[guardian] no API key — skipping");
    return [];
  }

  const out: GuardianArticle[] = [];
  for (const s of SECTIONS) {
    try {
      const res = await axios.get("https://content.guardianapis.com/search", {
        params: {
          "api-key": apiKey,
          section: s.id,
          "page-size": 8,
          "show-fields": "bodyText,trailText,thumbnail,byline",
          "show-tags": "keyword"
        },
        timeout: 8000
      });
      for (const r of res.data?.response?.results || []) {
        const fields = r.fields || {};
        if (!fields.bodyText || !r.webTitle) continue;
        out.push({
          source: "Guardian",
          category: s.category,
          title: r.webTitle,
          body: fields.bodyText,
          trailText: stripHtml(fields.trailText || ""),
          url: r.webUrl,
          thumbnail: fields.thumbnail || null,
          publishedAt: r.webPublicationDate || new Date().toISOString(),
          author: fields.byline || null,
          tags: (r.tags || [])
            .filter((t: any) => t.type === "keyword")
            .map((t: any) => t.webTitle)
            .slice(0, 8)
        });
      }
    } catch (err: any) {
      console.warn(`[guardian] ${s.id} failed: ${err?.message}`);
    }
  }
  return out;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}
