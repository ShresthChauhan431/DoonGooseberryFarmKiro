export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import Script from 'next/script';
import { Suspense } from 'react';
import { MobileFilterSheet } from '@/components/product/mobile-filter-sheet';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/product/product-filters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth/session';
import { getCategories } from '@/lib/queries/categories';
import { getProducts } from '@/lib/queries/products';

// Revalidate every 60 seconds
// export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: 'price-asc' | 'price-desc' | 'newest';
    priceMin?: string;
    priceMax?: string;
    search?: string;
    page?: string;
  }>;
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map(() => (
        <div key={Math.random()} className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function buildPageUrl(params: Record<string, string | undefined>, page: number): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && key !== 'page') {
      searchParams.set(key, value);
    }
  }
  if (page > 1) {
    searchParams.set('page', String(page));
  }
  const qs = searchParams.toString();
  return `/shop${qs ? `?${qs}` : ''}`;
}

async function ProductGrid({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  // Get session for userId
  const session = await getSession();
  const userId = session?.user?.id;

  const currentPage = params.page ? Math.max(1, Number.parseInt(params.page, 10) || 1) : 1;

  const filters = {
    category: params.category,
    sort: params.sort,
    // Convert rupees to paise (multiply by 100)
    priceMin: params.priceMin ? Number.parseInt(params.priceMin, 10) * 100 : undefined,
    priceMax: params.priceMax ? Number.parseInt(params.priceMax, 10) * 100 : undefined,
    search: params.search,
    page: currentPage,
    limit: 12,
  };

  const { products, total, page, totalPages } = await getProducts(filters);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} userId={userId} />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
          {page > 1 && (
            <Link href={buildPageUrl(params, page - 1)}>
              <Button variant="outline" size="sm">
                ← Previous
              </Button>
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
              if (idx > 0 && arr[idx - 1] !== p - 1) {
                acc.push('ellipsis');
              }
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-before-${item === 'ellipsis' ? idx : item}`}
                  className="px-2 text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Link key={item} href={buildPageUrl(params, item)}>
                  <Button
                    variant={item === page ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-[2.25rem]"
                  >
                    {item}
                  </Button>
                </Link>
              )
            )}

          {page < totalPages && (
            <Link href={buildPageUrl(params, page + 1)}>
              <Button variant="outline" size="sm">
                Next →
              </Button>
            </Link>
          )}
        </nav>
      )}

      <p className="text-center text-sm text-muted-foreground mt-4">
        Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total} products
      </p>
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
      <Script id="breadcrumb-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(breadcrumbSchema)}
      </Script>

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
