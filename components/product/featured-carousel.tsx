import { getFeaturedProducts } from '@/lib/queries/products';
import { ProductCard } from './product-card';

export async function FeaturedCarousel() {
  const products = await getFeaturedProducts(6);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 snap-x snap-mandatory pb-4">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[280px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
