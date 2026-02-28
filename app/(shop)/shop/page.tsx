import { Suspense } from 'react';
import { MobileFilterSheet } from '@/components/product/mobile-filter-sheet';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/product/product-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth/session';
import { getCategories } from '@/lib/queries/categories';
import { getProducts } from '@/lib/queries/products';

// Revalidate every 60 seconds
export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: 'price-asc' | 'price-desc' | 'newest';
    priceMin?: string;
    priceMax?: string;
    search?: string;
  }>;
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function ProductGrid({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  // Get session for userId
  const session = await getSession();
  const userId = session?.user?.id;

  const filters = {
    category: params.category,
    sort: params.sort,
    // Convert rupees to paise (multiply by 100)
    priceMin: params.priceMin ? Number.parseInt(params.priceMin) * 100 : undefined,
    priceMax: params.priceMax ? Number.parseInt(params.priceMax) * 100 : undefined,
    search: params.search,
  };

  const products = await getProducts(filters);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} userId={userId} />
      ))}
    </div>
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  // Find the current category if filtered
  const currentCategory = params.category
    ? categories.find((cat) => cat.slug === params.category)
    : null;

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
      ...(currentCategory
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: currentCategory.name,
              item: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop?category=${currentCategory.slug}`,
            },
          ]
        : []),
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shop All Products</h1>

        {/* Mobile Filter Button */}
        <MobileFilterSheet categories={categories} />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <ProductFilters categories={categories} />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
