import Link from "next/link";
import type { Article, Category } from "../types";
import ArticleGrid from "./ArticleGrid";

export default function CategorySection({
  category,
  articles,
  cols = 4
}: {
  category: Category;
  articles: Article[];
  cols?: 4 | 5;
}) {
  return (
    <section data-category={category.slug} className="border-t border-[var(--line)] pt-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-2xl font-bold">{category.name}</h2>
        <Link
          href={`/category/${category.slug}`}
          className="text-sm hover:underline text-[var(--muted)]"
        >
          More in {category.name} →
        </Link>
      </div>
      <ArticleGrid articles={articles.slice(0, cols)} cols={cols} />
    </section>
  );
}
