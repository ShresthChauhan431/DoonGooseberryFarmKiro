'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageInput } from '@/components/admin/image-input';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sanitizeHtmlContent } from '@/lib/sanitize';

type BlogFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
};

interface BlogFormProps {
  initialData?: BlogFormData;
  isEditing?: boolean;
}

export function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<BlogFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featuredImage: initialData?.featuredImage || '',
    author: initialData?.author || '',
    category: initialData?.category || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'title' && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageChange = (image: string) => {
    setFormData((prev) => ({ ...prev, featuredImage: image }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.slug.trim()) {
      setError('Slug is required');
      setLoading(false);
      return;
    }

    if (!formData.featuredImage.trim()) {
      setError('Featured image is required');
      setLoading(false);
      return;
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      setError('Content is required');
      setLoading(false);
      return;
    }

    try {
      const sanitizedContent = sanitizeHtmlContent(formData.content);
      const url = isEditing ? `/api/blog/id/${initialData?.id}` : '/api/blog';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, content: sanitizedContent }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save blog');
      }

      toast({
        title: 'Success',
        description: isEditing ? 'Blog updated successfully' : 'Blog created successfully',
      });

      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter blog title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">
          Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="blog-url-slug"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">
          Excerpt <span className="text-destructive">*</span>
        </Label>
        <Input
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          placeholder="Brief description of the blog post"
          required
        />
      </div>

      <ImageInput
        label="Featured Image"
        value={formData.featuredImage}
        onChange={handleImageChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Author name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Blog category"
          />
        </div>
      </div>

      <RichTextEditor
        label="Content"
        value={formData.content}
        onChange={handleContentChange}
        placeholder="Write your blog content here..."
        required
      />

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Blog' : 'Create Blog'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/blog')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
