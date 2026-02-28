import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/product-form';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { getCategories } from '@/lib/queries/categories';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Get product by ID
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);

  if (!product) {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 mt-1">Update product information</p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
