import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { title, slug, excerpt, content, featuredImage, author, category } = body;

    if (!title || !slug || !excerpt || !content || !featuredImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db
      .update(blogs)
      .set({
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        author,
        category,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result = await db.delete(blogs).where(eq(blogs.id, id)).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
