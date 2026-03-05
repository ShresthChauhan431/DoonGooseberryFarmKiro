'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { updateSettings } from '@/lib/actions/settings';

interface DeliveryChargesFormProps {
  settings: {
    standardDeliveryCharge: number;
    freeDeliveryThreshold: number;
    expressDeliveryEnabled: boolean;
    expressDeliveryCharge: number;
  };
}

export function DeliveryChargesForm({ settings }: DeliveryChargesFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const standardCharge = Number.parseFloat(formData.get('standardDeliveryCharge') as string);
    const freeThreshold = Number.parseFloat(formData.get('freeDeliveryThreshold') as string);
    const expressEnabled = formData.get('expressDeliveryEnabled') === 'on';
    const expressCharge = Number.parseFloat(formData.get('expressDeliveryCharge') as string);

    // Validation
    if (standardCharge < 0) {
      toast({
        title: 'Error',
        description: 'Standard delivery charge cannot be negative',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (freeThreshold < 0) {
      toast({
        title: 'Error',
        description: 'Free delivery threshold cannot be negative',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (expressEnabled && expressCharge < 0) {
      toast({
        title: 'Error',
        description: 'Express delivery charge cannot be negative',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const settingsToUpdate = [
      {
        key: 'standard_delivery_charge',
        value: (standardCharge * 100).toString(), // Convert to paise
        type: 'number',
        category: 'delivery',
      },
      {
        key: 'free_delivery_threshold',
        value: (freeThreshold * 100).toString(), // Convert to paise
        type: 'number',
        category: 'delivery',
      },
      {
        key: 'express_delivery_enabled',
        value: expressEnabled ? 'true' : 'false',
        type: 'boolean',
        category: 'delivery',
      },
      {
        key: 'express_delivery_charge',
        value: (expressCharge * 100).toString(), // Convert to paise
        type: 'number',
        category: 'delivery',
      },
    ];

    const result = await updateSettings(settingsToUpdate);

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="standardDeliveryCharge">Standard Delivery Charge (₹)</Label>
          <Input
            id="standardDeliveryCharge"
            name="standardDeliveryCharge"
            type="number"
            step="0.01"
            min="0"
            defaultValue={settings.standardDeliveryCharge / 100}
            required
          />
          <p className="text-xs text-muted-foreground">
            Flat delivery charge for orders below the free delivery threshold
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (₹)</Label>
          <Input
            id="freeDeliveryThreshold"
            name="freeDeliveryThreshold"
            type="number"
            step="0.01"
            min="0"
            defaultValue={settings.freeDeliveryThreshold / 100}
            required
          />
          <p className="text-xs text-muted-foreground">
            Minimum order value for free delivery. Set to 0 to disable free delivery.
          </p>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <Label htmlFor="expressDeliveryEnabled">Express Delivery</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to choose faster delivery
              </p>
            </div>
            <Switch
              id="expressDeliveryEnabled"
              name="expressDeliveryEnabled"
              defaultChecked={settings.expressDeliveryEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expressDeliveryCharge">Express Delivery Charge (₹)</Label>
            <Input
              id="expressDeliveryCharge"
              name="expressDeliveryCharge"
              type="number"
              step="0.01"
              min="0"
              defaultValue={settings.expressDeliveryCharge / 100}
              required
            />
            <p className="text-xs text-muted-foreground">
              Additional charge for express delivery (1-2 days)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <h4 className="font-medium text-sm">Current Configuration:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • Orders below ₹{settings.freeDeliveryThreshold / 100}: ₹
            {settings.standardDeliveryCharge / 100} delivery charge
          </li>
          <li>• Orders ₹{settings.freeDeliveryThreshold / 100} and above: FREE delivery</li>
          {settings.expressDeliveryEnabled && (
            <li>• Express delivery available: +₹{settings.expressDeliveryCharge / 100}</li>
          )}
        </ul>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
