# xSeek Next.js Starter

A minimal Next.js 15 app that statically renders a blog from articles managed in [xSeek](https://www.xseek.io). No CMS, no headless framework — just `fetch()` calls to the xSeek V1 API and the Next.js App Router.

## What's in the box

```
app/
  layout.tsx
  page.tsx                    # landing
  blog/
    page.tsx                  # article index (SSG, revalidate=3600)
    [slug]/page.tsx           # full article (SSG via generateStaticParams + JSON-LD)
  api/revalidate/route.ts     # on-demand revalidate webhook
lib/
  xseek.ts                    # typed fetch helpers — listArticles, getArticleById, etc.
.env.example
```

That's the whole thing. Copy `lib/xseek.ts` into any existing Next.js app if you don't want the rest.

## Setup

```bash
cp .env.example .env.local
# fill in XSEEK_API_KEY, XSEEK_WEBSITE_ID, XSEEK_REVALIDATE_SECRET
npm install
npm run dev
```

Open http://localhost:3000/blog.

### Required env vars

| Variable | Where to find it |
|---|---|
| `XSEEK_API_URL` | Defaults to `https://www.xseek.io`. Override only if self-hosting. |
| `XSEEK_API_KEY` | xSeek dashboard → Organization → API Keys. Privilege: `articles:read`. |
| `XSEEK_WEBSITE_ID` | The `<id>` segment in `/dashboard/websites/<id>` URLs. |
| `XSEEK_REVALIDATE_SECRET` | Any random string. Use the same value when configuring the webhook in xSeek. |

## How rebuilds work

Pages are statically generated at build time and re-rendered every hour via `revalidate = 3600`. To refresh instantly when you publish in xSeek, point the xSeek webhook at:

```
POST https://yourdomain.com/api/revalidate?secret=<XSEEK_REVALIDATE_SECRET>
Content-Type: application/json

{ "slug": "your-article-slug" }
```

The handler revalidates `/blog/<slug>` and the `/blog` index.

## Customising

- Render Markdown instead of HTML: swap `article.content` for `article.contentMarkdown` in `app/blog/[slug]/page.tsx` and pipe through your renderer of choice.
- Add OpenGraph images, breadcrumbs, related articles: extend `generateMetadata` and the article page.
- Filter by status: `listArticles({ status: 'ready' })` etc. — the helpers in `lib/xseek.ts` accept it.
- Mount the blog at a different path: rename `app/blog/` to whatever you want.

## Deploy

Works on Vercel out of the box. Make sure to set the env vars in the project settings, and add the revalidate webhook URL to your xSeek website.
