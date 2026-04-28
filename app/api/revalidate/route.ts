import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// POST /api/revalidate?secret=<XSEEK_REVALIDATE_SECRET>
// Body: { slug: string } | { path: string }
//
// Point xSeek at this URL so the static pages refresh as soon as you
// publish or update an article in the dashboard.
export async function POST(request: Request) {
  const url = new URL(request.url);
  const provided = url.searchParams.get('secret');
  const expected = process.env.XSEEK_REVALIDATE_SECRET;

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  let body: { slug?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const path = body.path ?? (body.slug ? `/blog/${body.slug}` : null);
  if (!path) {
    return NextResponse.json({ error: 'Missing slug or path' }, { status: 400 });
  }

  revalidatePath(path);
  // Also refresh the index so new articles show up immediately.
  revalidatePath('/blog');

  return NextResponse.json({ revalidated: true, path });
}
