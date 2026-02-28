import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductReviews } from '@/components/product/product-reviews';
import { RelatedProducts } from '@/components/product/related-products';
import { isInWishlist } from '@/lib/actions/wishlist';
import { getSession } from '@/lib/auth/session';
import { getProductBySlug, getProducts, getRelatedProducts } from '@/lib/queries/products';
import { getProductReviewStats, getProductReviews } from '@/lib/queries/reviews';

// ISR: Revalidate every hour
export const revalidate = 3600;

// Generate static params for all active products
export async function generateStaticParams() {
  const products = await getProducts({ isActive: true });

  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Generate metadata for SEO
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

  // Return 404 if product not found
  if (!product) {
    notFound();
  }

  // Get session for userId
  const session = await getSession();
  const userId = session?.user?.id;

  // Get reviews and stats
  const [reviews, reviewStats, relatedProducts, inWishlist] = await Promise.all([
    getProductReviews(product.id),
    getProductReviewStats(product.id),
    getRelatedProducts(product.id, product.categoryId, 4),
    isInWishlist(product.id),
  ]);

  // JSON-LD structured data for Product schema
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
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop/${product.slug}`,
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

  // JSON-LD structured data for BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category?.name || 'Products',
        item: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop?category=${product.category?.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop/${product.slug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD structured data */}
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
          {/* Product Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Information */}
          <ProductInfo product={product} isInWishlist={inWishlist} userId={userId} />
        </div>

        {/* Reviews Section */}
        <section className="mt-12" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="sr-only">
            Customer Reviews
          </h2>
          <ProductReviews
            reviews={reviews}
            stats={reviewStats}
            productId={product.id}
            userId={undefined} // Will be implemented with auth
            hasVerifiedPurchase={false} // Will be implemented with auth
            hasExistingReview={false} // Will be implemented with auth
          />
        </section>

        {/* Related Products */}
        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="sr-only">
            Related Products
          </h2>
          <RelatedProducts products={relatedProducts} />
        </section>
      </div>
    </>
  );
}
