import Link from 'next/link';
import { listAllPublishedArticles } from '@/lib/xseek';

export const revalidate = 3600;

export default async function BlogIndex() {
  const articles = await listAllPublishedArticles();

  return (
    <main>
      <p>
        <Link href="/">← Home</Link>
      </p>
      <h1>Blog</h1>
      {articles.length === 0 ? (
        <p>No published articles yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {articles.map((article) => (
            <li key={article.id} style={{ borderBottom: '1px solid #eee', padding: '16px 0' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                <Link href={`/blog/${article.slug}`}>{article.title}</Link>
              </h2>
              {article.metaDescription && (
                <p style={{ margin: '4px 0 0', color: '#6b7080' }}>{article.metaDescription}</p>
              )}
              {article.publishedAt && (
                <small style={{ color: '#9ca0ad' }}>
                  {new Date(article.publishedAt).toLocaleDateString()}
                </small>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
