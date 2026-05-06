import TriggerView from "./TriggerView";

type ArticleContext = {
  id: string;
  title: string;
  category: string;
  source: string;
  publishedAt: string;
  readTimeMinutes: number;
  tags: string[];
};

type Props = {
  type: "home" | "category" | "article";
  category?: string | null;
  articleId?: string | null;
  article?: ArticleContext;
  viewName: string;
};

// Server component — renders an inline <script> that runs synchronously,
// guaranteeing chronicleData.page is populated before Launch fires.
export default function PageContext({
  type,
  category = null,
  articleId = null,
  article,
  viewName
}: Props) {
  const pageJson = JSON.stringify({ type, category: category ?? null, articleId: articleId ?? null });
  const articleJson = article ? JSON.stringify(article) : null;

  const inline = [
    `window.chronicleData = window.chronicleData || {};`,
    `window.chronicleData.page = ${pageJson};`,
    articleJson ? `window.chronicleData.article = ${articleJson};` : `delete window.chronicleData.article;`
  ].join(" ");

  return (
    <>
      {/* Sets data layer synchronously — before any script (including Launch) reads it */}
      <script dangerouslySetInnerHTML={{ __html: inline }} />
      {/* triggerView must be client-side — fires after Target loads */}
      <TriggerView viewName={viewName} />
    </>
  );
}
