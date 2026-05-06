import * as cheerio from "cheerio";
import axios from "axios";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const unwantedKeywords = [
  "subscribe now",
  "sign up",
  "newsletter",
  "advertisement",
  "sponsored content",
  "click here",
  "follow us on",
  "share this article",
  "cookie policy",
  "accept cookies",
  "privacy policy"
];

const verifyMessages = [
  "you are human",
  "are you human",
  "i'm not a robot",
  "recaptcha",
  "please enable javascript"
];

export interface ExtractionResult {
  body: string;
  keywords: string[];
  image: string | null;
}

export async function getArticleBody(
  url: string
): Promise<ExtractionResult | null> {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ChronicleBot/1.0; +https://chronicle.example)"
      }
    });
    if (response.status !== 200) throw new Error("Network response was not ok");

    const html = response.data as string;
    const $ = cheerio.load(html);

    const jsons = $('script[type="application/ld+json"]')
      .toArray()
      .map((element) => {
        try {
          return JSON.parse($(element).html() || "");
        } catch {
          return null;
        }
      })
      .filter(Boolean) as any[];

    let article: any;
    for (const json of jsons) {
      if (json["@graph"]) {
        article = json["@graph"].find(
          (data: any) =>
            data["@type"] === "NewsArticle" || data["@type"] === "Article"
        );
        if (article) break;
      } else if (
        json["@type"] === "NewsArticle" ||
        json["@type"] === "Article"
      ) {
        article = json;
        break;
      }
    }

    const ogImage = pickMetaImage($);

    if (article?.articleBody) {
      const cleaned = cleanText(article.articleBody);
      if (cleaned.split(/\s+/).length >= 100) {
        return {
          body: cleaned,
          keywords:
            typeof article.keywords === "string"
              ? article.keywords.split(",").map((k: string) => k.trim())
              : Array.isArray(article.keywords)
                ? article.keywords
                : [],
          image: pickJsonLdImage(article.image) || ogImage
        };
      }
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const articleContent = reader.parse();
    if (!articleContent?.textContent) return null;

    const lower = articleContent.textContent.toLowerCase();
    if (verifyMessages.some((w) => lower.includes(w))) return null;

    const cleaned = cleanText(articleContent.textContent);
    if (cleaned.split(/\s+/).length < 100) return null;

    return {
      body: cleaned,
      keywords: [],
      image: ogImage
    };
  } catch {
    return null;
  }
}

function pickJsonLdImage(img: any): string | null {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (Array.isArray(img)) {
    for (const i of img) {
      const r = pickJsonLdImage(i);
      if (r) return r;
    }
    return null;
  }
  if (typeof img === "object") {
    if (typeof img.url === "string") return img.url;
    if (Array.isArray(img.url)) return img.url[0] || null;
    if (typeof img["@id"] === "string") return img["@id"];
  }
  return null;
}

function pickMetaImage($: cheerio.CheerioAPI): string | null {
  const candidates = [
    'meta[property="og:image:secure_url"]',
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
    'link[rel="image_src"]'
  ];
  for (const sel of candidates) {
    const el = $(sel).first();
    const v = el.attr("content") || el.attr("href");
    if (v) return v;
  }
  return null;
}

function cleanText(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.split(/\s+/).length > 4)
    .filter(
      (line) => !unwantedKeywords.some((k) => line.toLowerCase().includes(k))
    )
    .join("\n");
}

export async function extractMany<T extends { url: string }>(
  items: T[],
  concurrency = 10
): Promise<Array<{ item: T; result: ExtractionResult | null }>> {
  const out: Array<{ item: T; result: ExtractionResult | null }> = [];
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      const item = items[idx];
      const result = await getArticleBody(item.url);
      out[idx] = { item, result };
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );

  return out;
}
