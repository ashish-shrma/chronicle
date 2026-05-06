import Link from "next/link";
import type { Article } from "../types";

export default function ArticleCard({
  article,
  size = "md"
}: {
  article: Article;
  size?: "sm" | "md" | "lg";
}) {
  const titleClass =
    size === "lg"
      ? "text-3xl md:text-4xl font-bold"
      : size === "sm"
        ? "text-base font-semibold"
        : "text-xl font-semibold";

  return (
    <Link
      href={`/article/${article.id}`}
      className="block group"
      data-article-id={article.id}
    >
      <article className="flex flex-col gap-2">
        {article.imageUrl && size !== "sm" && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={article.imageUrl}
            alt=""
            className={
              size === "lg"
                ? "w-full aspect-[16/9] object-cover"
                : "w-full aspect-[16/10] object-cover"
            }
            loading="lazy"
          />
        )}
        <div className="text-[10px] uppercase tracking-widest text-[var(--accent)]">
          {article.source} · {article.category}
        </div>
        <h3 className={`${titleClass} font-serif group-hover:underline`}>
          {article.title}
        </h3>
        {size !== "sm" && (
          <p className="text-sm text-[var(--muted)] line-clamp-3">
            {article.summary}
          </p>
        )}
        <div className="text-xs text-[var(--muted)]">
          {article.readTimeMinutes} min read ·{" "}
          {new Date(article.publishedAt).toLocaleDateString()}
        </div>
      </article>
    </Link>
  );
}
