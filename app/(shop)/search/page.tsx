import Link from 'next/link';
import { Suspense } from 'react';
import { ProductCard } from '@/components/product/product-card';
import { getProducts } from '@/lib/queries/products';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

async function SearchResults({ query }: { query: string }) {
  const products = await getProducts({
    search: query,
    isActive: true,
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No products found</h2>
        <p className="text-muted-foreground mb-6">No results found for &quot;{query}&quot;</p>
        <Link href="/shop" className="text-primary hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted aspect-square rounded-lg mb-4" />
          <div className="h-4 bg-muted rounded mb-2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        {query && <p className="text-muted-foreground">Showing results for &quot;{query}&quot;</p>}
      </div>

      {query ? (
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Enter a search query to find products</p>
        </div>
      )}
    </div>
  );
}
