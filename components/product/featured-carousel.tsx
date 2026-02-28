import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFeaturedProducts } from '@/lib/queries/products';
import { getProductImageBlurDataURL } from '@/lib/utils/image';
import { formatPrice } from '@/lib/utils/price';

export async function FeaturedCarousel() {
  const products = await getFeaturedProducts(6);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 snap-x snap-mandatory pb-4">
            {products.map((product) => (
              <Card key={product.id} className="flex-shrink-0 w-[280px] snap-start">
                <CardContent className="p-4">
                  <Link href={`/shop/${product.slug}`}>
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={product.images[0] || '/images/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                        sizes="280px"
                        placeholder="blur"
                        blurDataURL={getProductImageBlurDataURL()}
                      />
                    </div>
                  </Link>
                  <Link href={`/shop/${product.slug}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-primary">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {formatPrice(product.price)}
                  </p>
                  <Button className="w-full">Add to Cart</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
