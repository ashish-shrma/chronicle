import type { Article } from "../types";
import ArticleCard from "./ArticleCard";

export default function ArticleGrid({
  articles,
  cols = 4,
  size = "md"
}: {
  articles: Article[];
  cols?: 2 | 3 | 4 | 5;
  size?: "sm" | "md" | "lg";
}) {
  const colsClass =
    cols === 2
      ? "md:grid-cols-2"
      : cols === 3
        ? "md:grid-cols-3"
        : cols === 5
          ? "md:grid-cols-5"
          : "md:grid-cols-4";
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-6`}>
      {articles.map((a) => (
        <ArticleCard key={a.id} article={a} size={size} />
      ))}
    </div>
  );
}
