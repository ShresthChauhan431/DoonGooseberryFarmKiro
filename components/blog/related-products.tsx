import { ProductCard } from '@/components/product/product-card';
import { getProductsByIds } from '@/lib/queries/products';

interface RelatedProductsProps {
  productIds: string[];
}

export default async function RelatedProducts({ productIds }: RelatedProductsProps) {
  const products = await getProductsByIds(productIds);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Products Featured in This Recipe</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
