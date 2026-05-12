import * as path from "path";
import * as fs from "fs";
import type { Article } from "../types";
import { fetchAllRss } from "./extractors/rss";
import { fetchNewsApi } from "./extractors/newsapi";
import { fetchGuardian } from "./extractors/guardian";
import { extractMany } from "./extractors/content-extractor";
import { dedupe, makeId, makeSummary, readTime } from "./extractors/normalizer";
import { writeArticlesJson } from "./generators/articles-json";
import { writeRecsCsv } from "./generators/recs-csv";
import { writeCategoriesJson } from "./generators/categories-json";

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL || "https://chronicle.vercel.app";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "public", "data");
const FAILURE_LOG = path.join(PROJECT_ROOT, "scripts", "domain_failures.txt");
const MAX_ARTICLES = 1000;

async function main() {
  console.log("[ingest] start");

  const [rssItems, newsApiItems, guardianItems] = await Promise.all([
    fetchAllRss(),
    fetchNewsApi(process.env.NEWSAPI_KEY),
    fetchGuardian(process.env.GUARDIAN_API_KEY)
  ]);

  console.log(
    `[ingest] sources: rss=${rssItems.length} newsapi=${newsApiItems.length} guardian=${guardianItems.length}`
  );

  const articles: Article[] = [];

  // Guardian: full body already present
  for (const g of guardianItems) {
    const body = g.body.trim();
    if (body.split(/\s+/).length < 100) continue;
    const id = makeId(g.source, g.publishedAt, g.title);
    articles.push({
      id,
      title: g.title,
      summary: makeSummary(body, g.trailText),
      body,
      source: g.source,
      category: g.category,
      tags: g.tags,
      author: g.author,
      publishedAt: g.publishedAt,
      imageUrl: g.thumbnail,
      originalUrl: g.url,
      readTimeMinutes: readTime(body),
      language: "en"
    });
  }

  // NewsAPI: description-only, no scraping (free tier doesn't return body)
  for (const n of newsApiItems) {
    const body = n.description?.trim() || "";
    if (!body) continue;
    const id = makeId(n.source, n.publishedAt, n.title);
    articles.push({
      id,
      title: n.title,
      summary: makeSummary(body),
      body,
      source: n.source,
      category: n.category,
      tags: [],
      author: n.author,
      publishedAt: n.publishedAt,
      imageUrl: n.urlToImage,
      originalUrl: n.url,
      readTimeMinutes: readTime(body),
      language: "en"
    });
  }

  // RSS: extract bodies via JSON-LD / Readability
  console.log(`[ingest] extracting ${rssItems.length} RSS articles...`);
  const extracted = await extractMany(
    rssItems.map((r) => ({ ...r, url: r.link })),
    10
  );

  const failedDomains = new Set<string>();
  for (const { item, result } of extracted) {
    if (!result) {
      try {
        failedDomains.add(new URL(item.link).hostname);
      } catch {}
      continue;
    }
    const id = makeId(item.source, item.pubDate, item.title);
    articles.push({
      id,
      title: item.title,
      summary: makeSummary(result.body, item.contentSnippet),
      body: result.body,
      source: item.source,
      category: item.category,
      tags: result.keywords,
      author: item.author,
      publishedAt: item.pubDate,
      imageUrl: result.image || item.enclosureUrl,
      originalUrl: item.link,
      readTimeMinutes: readTime(result.body),
      language: "en"
    });
  }

  if (failedDomains.size > 0) {
    fs.writeFileSync(
      FAILURE_LOG,
      Array.from(failedDomains).sort().join("\n") + "\n"
    );
    console.warn(
      `[ingest] ${failedDomains.size} domains failed extraction → ${FAILURE_LOG}`
    );
  }

  const freshDeduped = dedupe(articles);

  // Merge with existing articles so old articles stay accessible for Target Recs
  const existingFile = path.join(OUT_DIR, "articles.json");
  let existing: Article[] = [];
  try {
    const raw = JSON.parse(fs.readFileSync(existingFile, "utf8"));
    existing = Array.isArray(raw.articles) ? raw.articles : [];
  } catch {
    // first run or file missing — start fresh
  }

  const merged = dedupe([...freshDeduped, ...existing])
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, MAX_ARTICLES);

  console.log(
    `[ingest] fresh=${freshDeduped.length} existing=${existing.length} merged=${merged.length}`
  );

  const deduped = merged;

  writeArticlesJson(deduped, OUT_DIR);
  writeRecsCsv(deduped, OUT_DIR, PUBLIC_BASE_URL);
  writeCategoriesJson(deduped, OUT_DIR);

  console.log("[ingest] done");
}

main().catch((err) => {
  console.error("[ingest] fatal:", err);
  process.exit(1);
});
