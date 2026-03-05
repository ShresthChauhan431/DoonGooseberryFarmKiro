export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductReviews } from '@/components/product/product-reviews';
import { RelatedProducts } from '@/components/product/related-products';
import { isInWishlist } from '@/lib/actions/wishlist';
import { getSession } from '@/lib/auth/session';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries/products';
import { getProductReviewStats, getProductReviews } from '@/lib/queries/reviews';

/**
 * Generate metadata for SEO (dynamic)
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Doon Farm`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: product.images.map((url) => ({
        url,
        alt: product.name,
      })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description.substring(0, 160),
      images: product.images,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const session = await getSession();
  const userId = session?.user?.id;

  const [reviews, reviewStats, relatedProducts, inWishlist] = await Promise.all([
    getProductReviews(product.id),
    getProductReviewStats(product.id),
    getRelatedProducts(product.id, product.categoryId, 4),
    isInWishlist(product.id),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-vercel-domain.vercel.app';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Doon Gooseberry Farm',
    },
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: 'INR',
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/shop/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Doon Gooseberry Farm',
      },
    },
    ...(reviewStats.totalReviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(reviewStats.averageRating).toFixed(1),
        reviewCount: reviewStats.totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${baseUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category?.name || 'Products',
        item: `${baseUrl}/shop?category=${product.category?.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${baseUrl}/shop/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo product={product} isInWishlist={inWishlist} userId={userId} />
        </div>

        <section className="mt-12">
          <ProductReviews
            reviews={reviews}
            stats={reviewStats}
            productId={product.id}
            userId={undefined}
            hasVerifiedPurchase={false}
            hasExistingReview={false}
          />
        </section>

        <section className="mt-12">
          <RelatedProducts products={relatedProducts} />
        </section>
      </div>
    </>
  );
}
