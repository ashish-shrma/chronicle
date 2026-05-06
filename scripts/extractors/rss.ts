import Parser from "rss-parser";

export interface RssSource {
  name: string;
  url: string;
  category: string;
}

export interface RssItem {
  source: string;
  category: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  author: string | null;
  enclosureUrl: string | null;
}

const SOURCES: RssSource[] = [
  { name: "BBC", url: "http://feeds.bbci.co.uk/news/rss.xml", category: "world" },
  { name: "BBC", url: "http://feeds.bbci.co.uk/news/technology/rss.xml", category: "tech" },
  { name: "BBC", url: "http://feeds.bbci.co.uk/news/business/rss.xml", category: "business" },
  { name: "Reuters", url: "https://feeds.reuters.com/Reuters/worldNews", category: "world" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "tech" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "tech" },
  { name: "Hacker News", url: "https://hnrss.org/frontpage", category: "tech" }
];

type CustomItem = {
  "media:thumbnail"?: any;
  "media:content"?: any;
  "media:group"?: any;
  "content:encoded"?: string;
};

function pickRssImage(item: any): string | null {
  // 1. enclosure
  const enc = item.enclosure?.url;
  if (enc) return enc;

  // 2. media:thumbnail (BBC, Atom feeds)
  const thumb = item["media:thumbnail"];
  if (thumb) {
    if (Array.isArray(thumb)) {
      const t = thumb[0];
      if (typeof t === "string") return t;
      if (t?.$?.url) return t.$.url;
      if (t?.url) return t.url;
    } else if (typeof thumb === "object") {
      if (thumb.$?.url) return thumb.$.url;
      if (thumb.url) return thumb.url;
    }
  }

  // 3. media:content (TechCrunch, Verge)
  const mc = item["media:content"];
  if (mc) {
    if (Array.isArray(mc)) {
      for (const m of mc) {
        const u = m?.$?.url || m?.url;
        if (u) return u;
      }
    } else if (typeof mc === "object") {
      if (mc.$?.url) return mc.$.url;
      if (mc.url) return mc.url;
    }
  }

  // 4. media:group containing media:content
  const mg = item["media:group"];
  if (mg?.["media:content"]) {
    const inner = pickRssImage({ "media:content": mg["media:content"] });
    if (inner) return inner;
  }

  // 5. first <img> inside content:encoded or content
  const html = item["content:encoded"] || item.content || "";
  if (typeof html === "string") {
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m) return m[1];
  }

  return null;
}

export async function fetchAllRss(): Promise<RssItem[]> {
  const parser = new Parser<unknown, CustomItem>({
    timeout: 10000,
    customFields: {
      item: [
        ["media:thumbnail", "media:thumbnail", { keepArray: true }],
        ["media:content", "media:content", { keepArray: true }],
        ["media:group", "media:group"],
        ["content:encoded", "content:encoded"]
      ]
    }
  });

  const results = await Promise.allSettled(
    SOURCES.map(async (s) => {
      const feed = await parser.parseURL(s.url);
      return (feed.items || []).map<RssItem>((it: any) => ({
        source: s.name,
        category: s.category,
        title: it.title?.trim() || "",
        link: (it.link || "").trim(),
        pubDate: it.isoDate || it.pubDate || new Date().toISOString(),
        contentSnippet: (it.contentSnippet || it.summary || "").slice(0, 600),
        author: it.creator || it.author || null,
        enclosureUrl: pickRssImage(it)
      }));
    })
  );

  const items: RssItem[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else console.warn(`[rss] ${SOURCES[i].url} failed: ${r.reason}`);
  });
  return items;
}

export { SOURCES };
