import PageContext from "../../components/PageContext";

export default function AboutPage() {
  return (
    <>
      <PageContext type="home" viewName="about" />
      <article className="max-w-2xl mx-auto prose prose-lg">
        <h1 className="font-serif text-4xl font-bold mb-4">About Chronicle</h1>
        <p className="text-[var(--muted)]">
          Chronicle is a demo news aggregator built to showcase Adobe Target
          personalization, Adobe Analytics with Analytics-for-Target reporting,
          and Customer Attributes for authenticated reader scenarios.
        </p>
        <p className="text-[var(--muted)] mt-4">
          Articles are aggregated every six hours from BBC, Reuters, the
          Guardian, TechCrunch, The Verge, Hacker News, and NewsAPI. Full text
          links back to the original publisher.
        </p>
      </article>
    </>
  );
}
