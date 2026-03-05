import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CouponForm } from '@/components/admin/coupon-form';
import { Button } from '@/components/ui/button';

export default function NewCouponPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/coupons">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Coupons
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Coupon</h1>
        <p className="text-muted-foreground mt-2">Add a new discount coupon for your customers</p>
      </div>

      <CouponForm />
    </div>
  );
}
