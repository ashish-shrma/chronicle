export default function RecommendationsRail({
  zone,
  title
}: {
  zone: "recently-viewed" | "for-you" | "related";
  title: string;
}) {
  return (
    <section className="border-t border-[var(--line)] pt-6">
      <h2 className="font-serif text-2xl font-bold mb-4">{title}</h2>
      <div
        className="target-zone min-h-[140px] text-sm text-[var(--muted)] italic"
        data-zone={zone}
      >
        {/* Adobe Target Recommendations injects content here. */}
        Recommendations will appear here once Adobe Target activities are live.
      </div>
    </section>
  );
}
