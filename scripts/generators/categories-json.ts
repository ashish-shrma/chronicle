import * as fs from "fs";
import * as path from "path";
import type { Article, Category } from "../../types";

const META: Record<string, { name: string; description: string }> = {
  tech: { name: "Tech", description: "Software, hardware, AI, and the industry that builds them." },
  world: { name: "World", description: "International news and politics." },
  business: { name: "Business", description: "Markets, companies, and the global economy." },
  science: { name: "Science", description: "Research, discovery, and the natural world." },
  culture: { name: "Culture", description: "Arts, media, and society." },
  sports: { name: "Sports", description: "Games, athletes, and competition." }
};

export function writeCategoriesJson(articles: Article[], outDir: string) {
  fs.mkdirSync(outDir, { recursive: true });

  const counts: Record<string, number> = {};
  for (const a of articles) counts[a.category] = (counts[a.category] || 0) + 1;

  const categories: Category[] = Object.keys(META).map((slug) => ({
    slug,
    name: META[slug].name,
    description: META[slug].description,
    articleCount: counts[slug] || 0
  }));

  const file = path.join(outDir, "categories.json");
  fs.writeFileSync(file, JSON.stringify({ categories }, null, 2));
  console.log(`[categories] wrote ${categories.length} → ${file}`);
}
