// Minimal fetch helpers for the xSeek V1 API.
// Copy this file into your own project and adapt as you need.

export type XseekArticleSummary = {
  id: string;
  title: string;
  slug: string;
  metaDescription: string | null;
  status: string;
  qualityScore: number | null;
  opportunityId: string | null;
  createdAt: string;
  publishedAt: string | null;
};

export type XseekArticle = XseekArticleSummary & {
  content: string | null;
  contentMarkdown: string | null;
  brief: string | null;
  schemaMarkup: unknown | null;
  generationSteps: unknown | null;
};

const API_URL = process.env.XSEEK_API_URL ?? 'https://www.xseek.io';
const API_KEY = process.env.XSEEK_API_KEY;
const WEBSITE_ID = process.env.XSEEK_WEBSITE_ID;

function assertEnv() {
  if (!API_KEY) throw new Error('XSEEK_API_KEY is not set');
  if (!WEBSITE_ID) throw new Error('XSEEK_WEBSITE_ID is not set');
}

async function xseekFetch<T>(path: string, init?: RequestInit): Promise<T> {
  assertEnv();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...(init?.headers ?? {}),
    },
    // Cache by default — pages override with their own `revalidate`.
    next: { revalidate: 3600, ...(init as { next?: { revalidate?: number } })?.next },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`xSeek ${res.status} ${res.statusText}: ${body}`);
  }
  const json = (await res.json()) as { success: boolean; data: T; error?: string };
  if (!json.success) throw new Error(json.error ?? 'xSeek request failed');
  return json.data;
}

export async function listArticles(params?: {
  status?: 'draft' | 'ready' | 'published';
  page?: number;
  pageSize?: number;
}): Promise<{
  articles: XseekArticleSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.page) search.set('page', String(params.page));
  if (params?.pageSize) search.set('pageSize', String(params.pageSize));
  const query = search.toString();
  return xseekFetch(
    `/api/v1/websites/${WEBSITE_ID}/articles${query ? `?${query}` : ''}`,
  );
}

export async function getArticleById(id: string): Promise<XseekArticle> {
  return xseekFetch(`/api/v1/websites/${WEBSITE_ID}/articles/${id}`);
}

// Convenience: walk every published page and pull the matching article.
export async function getPublishedArticleBySlug(slug: string): Promise<XseekArticle | null> {
  let page = 1;
  while (true) {
    const { articles, pagination } = await listArticles({ status: 'published', page, pageSize: 100 });
    const summary = articles.find((a) => a.slug === slug);
    if (summary) return getArticleById(summary.id);
    if (!pagination.hasNextPage) return null;
    page += 1;
  }
}

export async function listAllPublishedArticles(): Promise<XseekArticleSummary[]> {
  const all: XseekArticleSummary[] = [];
  let page = 1;
  while (true) {
    const { articles, pagination } = await listArticles({ status: 'published', page, pageSize: 100 });
    all.push(...articles);
    if (!pagination.hasNextPage) return all;
    page += 1;
  }
}
