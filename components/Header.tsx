import Link from "next/link";
import { getCategories } from "../lib/articles";
import WeatherWidget from "./WeatherWidget";

export default function Header() {
  const cats = getCategories();
  return (
    <header className="border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="target-zone" data-zone="weather">
        <WeatherWidget />
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-baseline justify-between">
        <Link href="/" className="font-serif text-3xl font-bold tracking-tight">
          Chronicle
        </Link>
        <nav className="flex gap-4 text-sm">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="hover:underline"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/about" className="hover:underline text-[var(--muted)]">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
