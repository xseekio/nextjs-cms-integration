import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>xSeek Next.js Starter</h1>
      <p>
        Static blog rendered from xSeek. Articles below are fetched at build time via the
        xSeek V1 API and revalidated on demand when xSeek publishes a change.
      </p>
      <p>
        <Link href="/blog">→ Browse the blog</Link>
      </p>
    </main>
  );
}
