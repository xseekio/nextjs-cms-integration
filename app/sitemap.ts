import type { MetadataRoute } from 'next';
import { listAllPublishedArticles } from '@/lib/xseek';

// Set this in .env.local to generate absolute URLs in the sitemap.
// Example: SITE_URL=https://yourdomain.com
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.9 },
  ];

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await listAllPublishedArticles();
    articleEntries = articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      // Prefer the actual last-edit time from xSeek; fall back to publish time,
      // then create time. Crawlers re-index more aggressively when lastmod
      // reflects real content changes.
      lastModified: new Date(a.updatedAt ?? a.publishedAt ?? a.createdAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (e) {
    console.warn('[sitemap] failed to fetch articles from xSeek, returning static entries only', e);
  }

  return [...staticEntries, ...articleEntries];
}
