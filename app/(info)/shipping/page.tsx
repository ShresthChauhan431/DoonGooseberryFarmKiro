import { InfoCard } from '@/components/info/info-card';

export const metadata = {
  title: 'Shipping Policy - Doon Gooseberry Farm',
  description: 'Learn about our shipping policies and delivery times.',
};

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shipping Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().getFullYear()}</p>
      </div>

      <InfoCard title="Shipping Partners">
        <p>We work with trusted shipping partners to deliver your orders safely and on time.</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>FedEx</li>
          <li>Delhivery</li>
          <li>Blue Dart</li>
          <li>India Post</li>
        </ul>
      </InfoCard>

      <InfoCard title="Delivery Time">
        <p>Delivery times may vary based on your location:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            <strong>Metropolitan cities:</strong> 3-5 business days
          </li>
          <li>
            <strong>Other cities:</strong> 5-7 business days
          </li>
          <li>
            <strong>Remote areas:</strong> 7-14 business days
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Shipping Charges">
        <p>Shipping charges are calculated based on:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Weight of the order</li>
          <li>Delivery location</li>
          <li>Shipping method selected</li>
        </ul>
        <p className="mt-2">Free shipping may be available on orders above a certain value.</p>
      </InfoCard>

      <InfoCard title="Order Processing">
        <ul className="list-disc pl-6 space-y-1">
          <li>Orders are processed within 1-2 business days</li>
          <li>Orders placed before 2 PM IST are processed the same day</li>
          <li>We do not process orders on weekends and holidays</li>
        </ul>
      </InfoCard>

      <InfoCard title="Tracking Your Order">
        <p>
          Once your order is shipped, you will receive a tracking number via email. You can track
          your order using our website or the carrier's tracking portal.
        </p>
      </InfoCard>

      <InfoCard title="Shipping Restrictions">
        <ul className="list-disc pl-6 space-y-1">
          <li>We ship to most locations across India</li>
          <li>Some remote areas may have limited delivery options</li>
          <li>International shipping is not currently available</li>
        </ul>
      </InfoCard>

      <InfoCard title="Damaged or Lost Packages">
        <p>
          If your package is damaged or lost during transit, please contact us within 48 hours of
          the expected delivery date. We will work with the shipping carrier to resolve the issue.
        </p>
      </InfoCard>

      <InfoCard title="Contact Us">
        <p>
          For shipping inquiries, please contact us at{' '}
          <a href="mailto:info@doongooseberry.com" className="text-primary hover:underline">
            info@doongooseberry.com
          </a>
          .
        </p>
      </InfoCard>
    </div>
  );
}
