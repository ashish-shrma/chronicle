import type { Article } from "../types";
import ArticleCard from "./ArticleCard";

export default function HeroRail({ article }: { article: Article | null }) {
  if (!article) {
    return (
      <div className="target-zone py-8 text-center text-[var(--muted)]" data-zone="hero">
        No articles yet — run the ingestion pipeline.
      </div>
    );
  }
  return (
    <div className="target-zone" data-zone="hero">
      <ArticleCard article={article} size="lg" />
    </div>
  );
}
