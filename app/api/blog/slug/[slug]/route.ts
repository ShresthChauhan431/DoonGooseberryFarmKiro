import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const blogBySlug = await db.select().from(blogs).where(eq(blogs.slug, slug));

    if (blogBySlug.length > 0) {
      return NextResponse.json(blogBySlug[0]);
    }

    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}
