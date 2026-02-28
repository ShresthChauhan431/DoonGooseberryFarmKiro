import { Calendar } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatDate, getAllBlogPosts } from '@/lib/mdx';
import { getBlogImageBlurDataURL } from '@/lib/utils/image';

export const metadata: Metadata = {
  title: 'Blog - Doon Gooseberry Farm',
  description:
    'Read our latest recipes, farm stories, and product highlights from Doon Gooseberry Farm.',
  openGraph: {
    title: 'Blog - Doon Gooseberry Farm',
    description:
      'Read our latest recipes, farm stories, and product highlights from Doon Gooseberry Farm.',
    type: 'website',
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <p className="text-muted-foreground">No blog posts available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Discover recipes, farm stories, and learn more about our natural products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL={getBlogImageBlurDataURL()}
                />
              </div>
              <CardHeader>
                <h2 className="text-xl font-semibold line-clamp-2">{post.title}</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
