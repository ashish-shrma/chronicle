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

// Server component — inline script sets the data layer synchronously so it's
// available when Launch reads targetPageParams on Library Loaded.
// triggerView is fired by ReaderPicker (homepage) or TriggerView (other pages).
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
    `window.chronicleData.viewName = ${JSON.stringify(viewName)};`,
    articleJson
      ? `window.chronicleData.article = ${articleJson};`
      : `delete window.chronicleData.article;`
  ].join(" ");

  return <script dangerouslySetInnerHTML={{ __html: inline }} />;
}
