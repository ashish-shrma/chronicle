import { notFound } from "next/navigation";
import { getAllArticles, getArticleById } from "../../../lib/articles";
import RecommendationsRail from "../../../components/RecommendationsRail";
import PageContext from "../../../components/PageContext";
import TriggerView from "../../../components/TriggerView";
import ScrollDepthTracker from "../../../components/ScrollDepthTracker";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ id: a.id }));
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = getArticleById(params.id);
  if (!article) notFound();

  const paragraphs = article.body.split(/\n+/).filter(Boolean);

  return (
    <>
      <PageContext
        type="article"
        articleId={article.id}
        category={article.category}
        viewName={`article-${article.id}`}
        article={{
          id: article.id,
          title: article.title,
          category: article.category,
          source: article.source,
          publishedAt: article.publishedAt,
          readTimeMinutes: article.readTimeMinutes,
          tags: article.tags
        }}
      />
      <TriggerView viewName={`article-${article.id}`} />
      <ScrollDepthTracker articleId={article.id} />

      <article className="max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-[var(--accent)] mb-2">
          {article.source} · {article.category}
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          {article.title}
        </h1>
        <div className="text-sm text-[var(--muted)] mb-6">
          {article.author && <>By {article.author} · </>}
          {new Date(article.publishedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}{" "}
          · {article.readTimeMinutes} min read
        </div>

        {article.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={article.imageUrl}
            alt=""
            className="w-full aspect-[16/9] object-cover mb-6"
          />
        )}

        <div className="font-serif text-lg leading-relaxed space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--line)]">
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track="read-full"
            className="inline-block text-sm font-semibold underline"
          >
            Read the full article on {article.source} →
          </a>
        </div>

        {article.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.slice(0, 8).map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-1 bg-neutral-200 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </article>

      <div className="mt-16">
        <RecommendationsRail zone="related" title="Related articles" />
      </div>
    </>
  );
}
