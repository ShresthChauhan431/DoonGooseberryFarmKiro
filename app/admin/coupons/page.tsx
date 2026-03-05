import { Plus } from 'lucide-react';
import Link from 'next/link';
import { DeleteCouponButton } from '@/components/admin/delete-coupon-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllCoupons } from '@/lib/queries/coupons';
import { formatPrice } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await getAllCoupons();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground mt-2">Manage discount coupons for your store</p>
        </div>
        <Link href="/admin/coupons/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No coupons created yet</p>
            <Link href="/admin/coupons/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Coupon
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => {
            const isExpired = new Date(coupon.expiresAt) < new Date();
            const isMaxedOut = coupon.currentUses >= coupon.maxUses;
            const isActive = !isExpired && !isMaxedOut;

            return (
              <Card key={coupon.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl font-mono">{coupon.code}</CardTitle>
                        {isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="secondary">Max Uses Reached</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}% off`
                          : `${formatPrice(coupon.discountValue)} off`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/coupons/${coupon.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteCouponButton couponId={coupon.id} couponCode={coupon.code} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Min Order Value</p>
                      <p className="font-medium">{formatPrice(coupon.minOrderValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Usage</p>
                      <p className="font-medium">
                        {coupon.currentUses} / {coupon.maxUses}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expires At</p>
                      <p className="font-medium">
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(coupon.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
