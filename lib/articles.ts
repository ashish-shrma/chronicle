import * as fs from "fs";
import * as path from "path";
import type { Article, Category } from "../types";

interface ArticlesFile {
  generatedAt: string;
  articles: Article[];
}

interface CategoriesFile {
  categories: Category[];
}

let cached: ArticlesFile | null = null;
let cachedCats: CategoriesFile | null = null;

function load(): ArticlesFile {
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", "data", "articles.json");
  if (!fs.existsSync(file)) {
    cached = { generatedAt: new Date().toISOString(), articles: [] };
    return cached;
  }
  cached = JSON.parse(fs.readFileSync(file, "utf-8"));
  return cached!;
}

function loadCats(): CategoriesFile {
  if (cachedCats) return cachedCats;
  const file = path.join(process.cwd(), "public", "data", "categories.json");
  if (!fs.existsSync(file)) {
    cachedCats = { categories: [] };
    return cachedCats;
  }
  cachedCats = JSON.parse(fs.readFileSync(file, "utf-8"));
  return cachedCats!;
}

export function getAllArticles(): Article[] {
  return load().articles;
}

export function getArticleById(id: string): Article | null {
  return load().articles.find((a) => a.id === id) || null;
}

export function getArticlesByCategory(slug: string): Article[] {
  return load().articles.filter((a) => a.category === slug);
}

export function getCategories(): Category[] {
  return loadCats().categories;
}

export function getCategory(slug: string): Category | null {
  return loadCats().categories.find((c) => c.slug === slug) || null;
}

export function getTopByCategory(slug: string, limit: number): Article[] {
  return getArticlesByCategory(slug).slice(0, limit);
}

export function getHero(): Article | null {
  const all = getAllArticles();
  return all[0] || null;
}

export function getHeroByTopics(topics: string[]): Article | null {
  if (!topics.length) return getHero();
  const all = getAllArticles();
  return (
    all.find((a) => topics.includes(a.category)) ||
    all.find((a) => a.tags.some((t) => topics.includes(t))) ||
    all[0] ||
    null
  );
}
