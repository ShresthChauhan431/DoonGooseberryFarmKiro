import ProductForm from '@/components/admin/product-form';
import { getCategories } from '@/lib/queries/categories';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
        <p className="text-gray-500 mt-1">Add a new product to your catalog</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
