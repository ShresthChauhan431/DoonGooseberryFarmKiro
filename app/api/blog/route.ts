import { desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema';

export async function GET(_req: NextRequest) {
  try {
    const allBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
    return NextResponse.json(allBlogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const { title, slug, excerpt, content, featuredImage, author, category } = body;

    if (!title || !slug || !excerpt || !content || !featuredImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db
      .insert(blogs)
      .values({
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        author: author || session.user.name,
        category,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
