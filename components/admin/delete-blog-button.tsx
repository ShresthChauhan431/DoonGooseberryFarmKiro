'use client';

import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function DeleteBlogButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/blog/id/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to delete blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash className="h-4 w-4" />
    </Button>
  );
}
