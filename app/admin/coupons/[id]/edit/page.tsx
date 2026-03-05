import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CouponForm } from '@/components/admin/coupon-form';
import { Button } from '@/components/ui/button';
import { getCouponById } from '@/lib/queries/coupons';

export const dynamic = 'force-dynamic';

interface EditCouponPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const { id } = await params;
  const coupon = await getCouponById(id);

  if (!coupon) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/coupons">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Coupons
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Coupon</h1>
        <p className="text-muted-foreground mt-2">Update coupon details</p>
      </div>

      <CouponForm coupon={coupon} />
    </div>
  );
}
