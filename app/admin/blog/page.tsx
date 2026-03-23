import { desc } from 'drizzle-orm';
import { Edit, Plus } from 'lucide-react';
import Link from 'next/link';
import { DeleteBlogButton } from '@/components/admin/delete-blog-button';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const allBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Blog Post
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allBlogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No blog posts found.
                </td>
              </tr>
            ) : (
              allBlogs.map((blog) => (
                <tr key={blog.id} className="border-t border-border/50">
                  <td className="px-6 py-4 font-medium">{blog.title}</td>
                  <td className="px-6 py-4">{blog.slug}</td>
                  <td className="px-6 py-4">{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/admin/blog/${blog.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteBlogButton id={blog.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
