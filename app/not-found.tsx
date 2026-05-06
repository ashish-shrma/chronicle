import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="font-serif text-4xl font-bold mb-4">Not found</h1>
      <p className="text-[var(--muted)] mb-6">
        That page doesn't exist or has been removed.
      </p>
      <Link href="/" className="underline">
        Back to homepage
      </Link>
    </div>
  );
}
