import * as fs from "fs";
import * as path from "path";
import type { Article } from "../../types";

export function writeArticlesJson(articles: Article[], outDir: string) {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, "articles.json");
  fs.writeFileSync(
    file,
    JSON.stringify({ generatedAt: new Date().toISOString(), articles }, null, 2)
  );
  console.log(`[articles] wrote ${articles.length} → ${file}`);
}
