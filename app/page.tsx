import { getAllArticles, getCategories } from "../lib/articles";
import HomepageLayout from "../components/HomepageLayout";
import PageContext from "../components/PageContext";

export default function HomePage() {
  const allArticles = getAllArticles();
  const categories = getCategories();

  return (
    <>
      <PageContext type="home" viewName="home" />
      <HomepageLayout allArticles={allArticles} categories={categories} />
    </>
  );
}
