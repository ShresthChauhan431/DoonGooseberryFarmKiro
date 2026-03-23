import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { BlogForm } from '@/components/admin/blog-form';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const blogResults = await db.select().from(blogs).where(eq(blogs.id, id));

  if (blogResults.length === 0) {
    notFound();
  }

  const blog = blogResults[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
        <p className="text-muted-foreground">Update your existing blog post.</p>
      </div>

      <BlogForm
        initialData={{
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: blog.content,
          featuredImage: blog.featuredImage,
          author: blog.author || '',
          category: blog.category || '',
        }}
        isEditing
      />
    </div>
  );
}
