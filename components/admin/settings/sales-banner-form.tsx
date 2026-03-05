'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateSettings } from '@/lib/actions/settings';
import type { SiteSetting } from '@/lib/queries/settings';

interface SalesBannerFormProps {
  settings: SiteSetting[];
}

export function SalesBannerForm({ settings }: SalesBannerFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getSettingValue = (key: string, defaultValue: string = '') => {
    return settings.find((s) => s.key === key)?.value || defaultValue;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const settingsToUpdate = [
      {
        key: 'sales_banner_enabled',
        value: formData.get('sales_banner_enabled') === 'on' ? 'true' : 'false',
        type: 'boolean',
        category: 'homepage',
      },
      {
        key: 'sales_banner_text',
        value: formData.get('sales_banner_text') as string,
        category: 'homepage',
      },
      {
        key: 'sales_banner_link',
        value: formData.get('sales_banner_link') as string,
        category: 'homepage',
      },
      {
        key: 'sales_banner_bg_color',
        value: formData.get('sales_banner_bg_color') as string,
        category: 'homepage',
      },
      {
        key: 'sales_banner_text_color',
        value: formData.get('sales_banner_text_color') as string,
        category: 'homepage',
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sales Banner</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Display a promotional banner at the top of your homepage to highlight sales and special
          offers.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sales_banner_enabled">Enable Sales Banner</Label>
            <p className="text-sm text-muted-foreground">Show the sales banner on your homepage</p>
          </div>
          <Switch
            id="sales_banner_enabled"
            name="sales_banner_enabled"
            defaultChecked={getSettingValue('sales_banner_enabled', 'false') === 'true'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales_banner_text">Banner Text</Label>
          <Textarea
            id="sales_banner_text"
            name="sales_banner_text"
            defaultValue={getSettingValue(
              'sales_banner_text',
              '🎉 Summer Sale! Get 20% off on all products. Use code: SUMMER20'
            )}
            placeholder="Enter your promotional message"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Keep it short and compelling. Use emojis to make it eye-catching!
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales_banner_link">Banner Link (Optional)</Label>
          <Input
            id="sales_banner_link"
            name="sales_banner_link"
            defaultValue={getSettingValue('sales_banner_link', '/shop')}
            placeholder="/shop"
          />
          <p className="text-xs text-muted-foreground">
            Where should users go when they click the banner? Leave empty for no link.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sales_banner_bg_color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="sales_banner_bg_color"
                name="sales_banner_bg_color"
                type="color"
                defaultValue={getSettingValue('sales_banner_bg_color', '#16a34a')}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={getSettingValue('sales_banner_bg_color', '#16a34a')}
                readOnly
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales_banner_text_color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="sales_banner_text_color"
                name="sales_banner_text_color"
                type="color"
                defaultValue={getSettingValue('sales_banner_text_color', '#ffffff')}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={getSettingValue('sales_banner_text_color', '#ffffff')}
                readOnly
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: getSettingValue('sales_banner_bg_color', '#16a34a'),
            color: getSettingValue('sales_banner_text_color', '#ffffff'),
          }}
        >
          <p className="text-center font-medium">
            Preview:{' '}
            {getSettingValue(
              'sales_banner_text',
              '🎉 Summer Sale! Get 20% off on all products. Use code: SUMMER20'
            )}
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
