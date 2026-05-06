import type { Article } from "../../types";

export function makeId(source: string, publishedAt: string, title: string): string {
  const date = publishedAt.slice(0, 10);
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const src = source.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${src}-${date}-${slug}`;
}

export function readTime(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function makeSummary(body: string, fallback?: string): string {
  if (fallback && fallback.length > 60) return fallback.slice(0, 400);
  const trimmed = body.replace(/\s+/g, " ").trim();
  return trimmed.slice(0, 380) + (trimmed.length > 380 ? "…" : "");
}

export function dedupe(articles: Article[]): Article[] {
  const seen = new Set<string>();
  const out: Article[] = [];
  for (const a of articles) {
    const key = a.originalUrl || a.id;
    if (seen.has(key) || seen.has(a.id)) continue;
    seen.add(key);
    seen.add(a.id);
    out.push(a);
  }
  return out;
}
