import * as fs from "fs";
import * as path from "path";
import type { Article } from "../../types";

const HEADER = `## RECSRecommendations Upload File
## RECS''## RECS'' indicates a Recommendations pre-process header. Please do not remove these lines.
## RECS
## RECSentity.id,entity.name,entity.categoryId,entity.message,entity.thumbnailUrl,entity.value,entity.pageUrl,entity.inventory,entity.margin,entity.source,entity.publishedDate,entity.author,entity.tags,entity.readTime`;

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '""';
  const s = String(v).replace(/"/g, '""').replace(/\r?\n/g, " ");
  return `"${s}"`;
}

export function writeRecsCsv(
  articles: Article[],
  outDir: string,
  publicBaseUrl: string
) {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, "articles-feed.csv");

  const rows = articles.map((a) =>
    [
      csvEscape(a.id),
      csvEscape(a.title),
      csvEscape(a.category),
      csvEscape(a.summary),
      csvEscape(a.imageUrl || ""),
      csvEscape(0),
      csvEscape(`${publicBaseUrl}/article/${a.id}`),
      csvEscape(1),
      csvEscape(0),
      csvEscape(a.source),
      csvEscape(a.publishedAt.slice(0, 10)),
      csvEscape(a.author || ""),
      csvEscape((a.tags || []).join(",")),
      csvEscape(a.readTimeMinutes)
    ].join(",")
  );

  fs.writeFileSync(file, [HEADER, ...rows].join("\n"));
  console.log(`[recs] wrote ${articles.length} → ${file}`);
}
