import { notFound } from "next/navigation";
import {
  getArticlesByCategory,
  getCategories,
  getCategory
} from "../../../lib/articles";
import ArticleGrid from "../../../components/ArticleGrid";
import PageContext from "../../../components/PageContext";
import TriggerView from "../../../components/TriggerView";

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export default function CategoryPage({
  params
}: {
  params: { slug: string };
}) {
  const category = getCategory(params.slug);
  if (!category) notFound();

  const articles = getArticlesByCategory(params.slug);

  return (
    <>
      <PageContext
        type="category"
        category={params.slug}
        viewName={`category-${params.slug}`}
      />
      <TriggerView viewName={`category-${params.slug}`} />
      <header className="mb-8 border-b border-[var(--line)] pb-4">
        <div className="text-xs uppercase tracking-widest text-[var(--accent)]">
          Category
        </div>
        <h1 className="font-serif text-4xl font-bold">{category.name}</h1>
        <p className="text-[var(--muted)] mt-2">{category.description}</p>
      </header>
      <ArticleGrid articles={articles.slice(0, 24)} cols={3} />
    </>
  );
}
