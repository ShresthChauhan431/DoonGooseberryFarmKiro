import { eq } from 'drizzle-orm';
import { ArrowLeft, Calendar } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import type React from 'react';
import rehypePrettyCode from 'rehype-pretty-code';
import RelatedProducts from '@/components/blog/related-products';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema';
import { type BlogPostWithContent, formatDate, getBlogPost } from '@/lib/mdx';
import { getBlogImageBlurDataURL } from '@/lib/utils/image';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Try DB first
  let post = null;
  try {
    const dbPosts = await db.select().from(blogs).where(eq(blogs.slug, slug));
    if (dbPosts.length > 0) {
      const p = dbPosts[0];
      post = {
        title: p.title,
        excerpt: p.excerpt,
        featuredImage: p.featuredImage,
        date: p.createdAt.toISOString(),
      };
    }
  } catch (_e) {}

  // Fallback to MDX
  if (!post) {
    post = await getBlogPost(slug);
  }

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} - Doon Gooseberry Farm Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // Try DB first
  let dbPost = null;
  let compiledContent = null;

  try {
    const dbPosts = await db.select().from(blogs).where(eq(blogs.slug, slug));
    if (dbPosts.length > 0) {
      dbPost = dbPosts[0];

      const { content } = await compileMDX({
        source: dbPost.content,
        options: {
          parseFrontmatter: false,
          mdxOptions: {
            rehypePlugins: [
              [
                rehypePrettyCode,
                {
                  theme: 'github-dark',
                  keepBackground: true,
                },
              ],
            ],
          },
        },
      });
      compiledContent = content;
    }
  } catch (_e) {}

  let post: {
    title: string;
    date: string;
    author?: string;
    category?: string;
    featuredImage: string;
    content: React.ReactNode;
    relatedProducts?: string[];
  } | null = null;

  if (dbPost && compiledContent) {
    post = {
      title: dbPost.title,
      date: dbPost.createdAt.toISOString(),
      author: dbPost.author || undefined,
      category: dbPost.category || undefined,
      featuredImage: dbPost.featuredImage,
      content: compiledContent,
      relatedProducts: [], // Extend this later if needed
    };
  } else {
    // Fallback
    post = await getBlogPost(slug);
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            placeholder="blur"
            blurDataURL={getBlogImageBlurDataURL()}
          />
        </div>

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            {post.author && (
              <>
                <span>•</span>
                <span>By {post.author}</span>
              </>
            )}
            {post.category && (
              <>
                <span>•</span>
                <span className="capitalize">{post.category}</span>
              </>
            )}
          </div>
        </header>

        <article className="prose prose-lg max-w-none mb-12">{post.content}</article>

        {post.relatedProducts && post.relatedProducts.length > 0 && (
          <RelatedProducts productIds={post.relatedProducts} />
        )}
      </div>
    </div>
  );
}
