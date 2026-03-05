import { GeneralSettingsForm } from '@/components/admin/settings/general-settings-form';
import { HomepageSettingsForm } from '@/components/admin/settings/homepage-settings-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllSettings } from '@/lib/queries/settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const allSettings = await getAllSettings();

  // Group settings by category
  const settingsByCategory = allSettings.reduce(
    (acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    },
    {} as Record<string, typeof allSettings>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your website content and appearance</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsForm settings={settingsByCategory.general || []} />
        </TabsContent>

        <TabsContent value="homepage" className="space-y-4">
          <HomepageSettingsForm settings={settingsByCategory.homepage || []} />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
