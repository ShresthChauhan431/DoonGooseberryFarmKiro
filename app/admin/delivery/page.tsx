import { DeliveryChargesForm } from '@/components/admin/delivery-charges-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDeliverySettings } from '@/lib/queries/settings';

export const dynamic = 'force-dynamic';

export default async function DeliveryChargesPage() {
  const deliverySettings = await getDeliverySettings();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Delivery Charges</h1>
        <p className="text-muted-foreground mt-2">
          Configure shipping costs and free delivery thresholds
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliveryChargesForm settings={deliverySettings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-2">Standard Delivery</h4>
            <p>
              Customers will be charged the standard delivery fee for orders below the free delivery
              threshold.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Free Delivery</h4>
            <p>
              Orders that meet or exceed the free delivery threshold will automatically qualify for
              free shipping. This encourages customers to add more items to their cart.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Express Delivery (Optional)</h4>
            <p>
              If enabled, customers can choose express delivery for faster shipping at an additional
              cost. This option is available at checkout.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
