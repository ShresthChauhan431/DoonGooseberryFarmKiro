import { BlogForm } from '@/components/admin/blog-form';

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Blog Post</h1>
        <p className="text-muted-foreground">Add a new blog post to your store.</p>
      </div>

      <BlogForm />
    </div>
  );
}
