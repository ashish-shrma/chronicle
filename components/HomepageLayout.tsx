"use client";

import { useEffect, useState } from "react";
import type { Article, Category } from "../types";
import HeroRail from "./HeroRail";
import CategorySection from "./CategorySection";
import RecommendationsRail from "./RecommendationsRail";
import AdPlaceholder from "./AdPlaceholder";

type Experience = "default" | "premium" | "free";

interface Props {
  allArticles: Article[];
  categories: Category[];
}

const DEFAULT_ORDER = ["tech", "world", "business", "science"];

function heroByTopics(articles: Article[], topics: string[]): Article | null {
  if (!topics.length) return articles[0] || null;
  return (
    articles.find((a) => topics.includes(a.category)) ||
    articles.find((a) => a.tags.some((t) => topics.includes(t))) ||
    articles[0] ||
    null
  );
}

function sectionArticles(articles: Article[], slug: string, limit: number) {
  return articles.filter((a) => a.category === slug).slice(0, limit);
}

function categoryOrder(experience: Experience, topics: string[]): string[] {
  if (experience === "premium" && topics.length) {
    const rest = DEFAULT_ORDER.filter((s) => !topics.includes(s));
    return [...topics.filter((t) => DEFAULT_ORDER.includes(t)), ...rest];
  }
  return DEFAULT_ORDER;
}

export default function HomepageLayout({ allArticles, categories }: Props) {
  const [experience, setExperience] = useState<Experience>("default");
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    function handleExperience(e: Event) {
      const detail = (e as CustomEvent<{ experience: Experience; topics?: string[] }>).detail;
      setExperience(detail.experience ?? "default");
      setTopics(detail.topics ?? []);

      // keep data layer in sync so Analytics can pick it up
      if (typeof window !== "undefined") {
        window.chronicleData = window.chronicleData || {};
        window.chronicleData.page = {
          ...(window.chronicleData.page ?? {}),
          type: "home",
          category: null,
          articleId: null
        };
        (window.chronicleData as any).experience = detail.experience;
      }
    }

    document.addEventListener("chronicle:experience", handleExperience);
    return () => document.removeEventListener("chronicle:experience", handleExperience);
  }, []);

  const isPremium = experience === "premium";
  const isFree = experience === "free";
  const cols = isPremium ? 5 : 4;
  const hero = heroByTopics(allArticles, isPremium ? topics : []);
  const order = categoryOrder(experience, topics);

  return (
    <div className="target-zone" data-zone="layout" data-experience={experience}>
      {/* Experience badge — visible during demo so you can see what Target delivered */}
      {experience !== "default" && (
        <div
          className={`mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            isPremium
              ? "bg-amber-100 text-amber-800 border border-amber-300"
              : "bg-neutral-100 text-neutral-600 border border-neutral-300"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          {isPremium ? "Premium experience · Adobe Target" : "Free tier experience · Adobe Target"}
        </div>
      )}

      {/* Hero */}
      <section className="mb-10">
        <HeroRail article={hero} />
      </section>

      {/* Ad slot — visible for free tier only */}
      {isFree && (
        <section className="mb-10">
          <AdPlaceholder />
        </section>
      )}

      {/* Recently viewed (Recommendations placeholder) */}
      <section className="mb-10">
        <RecommendationsRail zone="recently-viewed" title="Recently viewed" />
      </section>

      {/* Category sections — order driven by experience */}
      <div className="target-zone space-y-10" data-zone="category-sections">
        {order.map((slug) => {
          const cat = categories.find((c) => c.slug === slug);
          if (!cat) return null;
          const articles = sectionArticles(allArticles, slug, cols);
          return (
            <CategorySection
              key={slug}
              category={cat}
              articles={articles}
              cols={cols as 4 | 5}
            />
          );
        })}
      </div>

      {/* For You (Recommendations placeholder) */}
      <section className="mt-10">
        <RecommendationsRail zone="for-you" title="For you" />
      </section>
    </div>
  );
}
