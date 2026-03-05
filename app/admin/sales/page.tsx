import { SalesBannerForm } from '@/components/admin/settings/sales-banner-form';
import { getAllSettings } from '@/lib/queries/settings';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const allSettings = await getAllSettings();

  // Filter out homepage settings for the sales banner form
  const homepageSettings = allSettings.filter((s) => s.category === 'homepage');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage promotional banners and active sales easily across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SalesBannerForm settings={homepageSettings} />
      </div>
    </div>
  );
}
