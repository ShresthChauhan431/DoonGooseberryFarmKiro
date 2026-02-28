'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateSettings } from '@/lib/actions/settings';
import type { SiteSetting } from '@/lib/queries/settings';

interface GeneralSettingsFormProps {
  settings: SiteSetting[];
}

export function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
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
      { key: 'site_name', value: formData.get('site_name') as string, category: 'general' },
      {
        key: 'site_description',
        value: formData.get('site_description') as string,
        category: 'general',
      },
      { key: 'contact_email', value: formData.get('contact_email') as string, category: 'general' },
      { key: 'contact_phone', value: formData.get('contact_phone') as string, category: 'general' },
      { key: 'facebook_url', value: formData.get('facebook_url') as string, category: 'general' },
      { key: 'instagram_url', value: formData.get('instagram_url') as string, category: 'general' },
      { key: 'twitter_url', value: formData.get('twitter_url') as string, category: 'general' },
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
        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">Basic information about your website</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input
            id="site_name"
            name="site_name"
            defaultValue={getSettingValue('site_name', 'Doon Gooseberry Farm')}
            placeholder="Your site name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_description">Site Description</Label>
          <Textarea
            id="site_description"
            name="site_description"
            defaultValue={getSettingValue(
              'site_description',
              'Farm-fresh gooseberry products from Uttarakhand'
            )}
            placeholder="Brief description of your site"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={getSettingValue('contact_email', 'contact@doonfarm.com')}
              placeholder="contact@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              defaultValue={getSettingValue('contact_phone', '+91-XXXXXXXXXX')}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Social Media Links</h4>

          <div className="space-y-2">
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input
              id="facebook_url"
              name="facebook_url"
              defaultValue={getSettingValue('facebook_url')}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input
              id="instagram_url"
              name="instagram_url"
              defaultValue={getSettingValue('instagram_url')}
              placeholder="https://instagram.com/yourpage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_url">Twitter URL</Label>
            <Input
              id="twitter_url"
              name="twitter_url"
              defaultValue={getSettingValue('twitter_url')}
              placeholder="https://twitter.com/yourpage"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
