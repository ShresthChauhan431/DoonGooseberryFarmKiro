'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/lib/actions/orders';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      toast({
        title: 'No Change',
        description: 'Status is already set to this value',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await updateOrderStatus(orderId, selectedStatus);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Order status updated successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update order status',
          variant: 'destructive',
        });
        // Reset to current status on error
        setSelectedStatus(currentStatus);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      setSelectedStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  const allowedStatuses = VALID_TRANSITIONS[currentStatus] || [];
  const canUpdate = selectedStatus !== currentStatus;

  return (
    <div className="space-y-4">
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {/* Current status */}
          <SelectItem value={currentStatus}>
            {STATUS_OPTIONS.find((s) => s.value === currentStatus)?.label}
          </SelectItem>

          {/* Allowed transitions */}
          {allowedStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_OPTIONS.find((s) => s.value === status)?.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleUpdate} disabled={!canUpdate || loading} className="w-full">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Update Status
      </Button>

      {allowedStatuses.length === 0 && (
        <p className="text-sm text-gray-500">This order cannot be updated further.</p>
      )}
    </div>
  );
}
