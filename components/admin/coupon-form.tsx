'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createCoupon, updateCoupon } from '@/lib/actions/coupons';

interface CouponFormProps {
  coupon?: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    minOrderValue: number;
    maxUses: number;
    currentUses: number;
    expiresAt: Date;
  };
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const code = (formData.get('code') as string).toUpperCase().trim();
    const discountType = formData.get('discountType') as 'PERCENTAGE' | 'FLAT';
    const discountValue = Number.parseFloat(formData.get('discountValue') as string);
    const minOrderValue = Number.parseFloat(formData.get('minOrderValue') as string) * 100; // Convert to paise
    const maxUses = Number.parseInt(formData.get('maxUses') as string, 10);
    const expiresAt = new Date(formData.get('expiresAt') as string);

    // Validation
    if (!code || code.length < 3) {
      toast({
        title: 'Error',
        description: 'Coupon code must be at least 3 characters',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (discountValue <= 0) {
      toast({
        title: 'Error',
        description: 'Discount value must be greater than 0',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (discountType === 'PERCENTAGE' && discountValue > 100) {
      toast({
        title: 'Error',
        description: 'Percentage discount cannot exceed 100%',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (maxUses <= 0) {
      toast({
        title: 'Error',
        description: 'Max uses must be greater than 0',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (expiresAt <= new Date()) {
      toast({
        title: 'Error',
        description: 'Expiry date must be in the future',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const couponData = {
      code,
      discountType,
      discountValue: discountType === 'PERCENTAGE' ? discountValue : discountValue * 100, // Convert to paise for flat discount
      minOrderValue,
      maxUses,
      expiresAt,
    };

    const result = coupon
      ? await updateCoupon(coupon.id, couponData)
      : await createCoupon(couponData);

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      router.push('/admin/coupons');
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              name="code"
              defaultValue={coupon?.code}
              placeholder="SUMMER2024"
              required
              disabled={!!coupon}
              className="font-mono uppercase"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              {coupon
                ? 'Code cannot be changed after creation'
                : 'Use uppercase letters and numbers (e.g., SAVE20)'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select name="discountType" defaultValue={coupon?.discountType || 'PERCENTAGE'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input
                id="discountValue"
                name="discountValue"
                type="number"
                step="0.01"
                min="0"
                defaultValue={
                  coupon
                    ? coupon.discountType === 'PERCENTAGE'
                      ? coupon.discountValue
                      : coupon.discountValue / 100
                    : ''
                }
                placeholder="10"
                required
              />
              <p className="text-xs text-muted-foreground">
                For percentage: 1-100. For flat: amount in rupees
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
              <Input
                id="minOrderValue"
                name="minOrderValue"
                type="number"
                step="0.01"
                min="0"
                defaultValue={coupon ? coupon.minOrderValue / 100 : '0'}
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum cart value required to use this coupon
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">Maximum Uses</Label>
              <Input
                id="maxUses"
                name="maxUses"
                type="number"
                min="1"
                defaultValue={coupon?.maxUses || ''}
                placeholder="100"
                required
              />
              <p className="text-xs text-muted-foreground">
                Total number of times this coupon can be used
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={coupon ? formatDateForInput(coupon.expiresAt) : ''}
              min={formatDateForInput(new Date())}
              required
            />
            <p className="text-xs text-muted-foreground">
              Coupon will expire at the end of this date
            </p>
          </div>

          {coupon && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Current Usage:{' '}
                <span className="font-medium text-foreground">
                  {coupon.currentUses} / {coupon.maxUses}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/coupons')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
