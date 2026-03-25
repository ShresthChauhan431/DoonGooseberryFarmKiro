import { InfoCard } from '@/components/info/info-card';

export const metadata = {
  title: 'Refund Policy - Doon Gooseberry Farm',
  description: 'Learn about our refund and return policies.',
};

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refund Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().getFullYear()}</p>
      </div>

      <InfoCard title="Return Eligibility">
        <p>
          We want you to be completely satisfied with your purchase. Here are our return guidelines:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Returns must be requested within 7 days of delivery</li>
          <li>Items must be unused and in original packaging</li>
          <li>Perishable items cannot be returned</li>
          <li>Sale items may have different return terms</li>
        </ul>
      </InfoCard>

      <InfoCard title="How to Request a Return">
        <p>To request a return:</p>
        <ol className="list-decimal pl-6 space-y-1 mt-2">
          <li>Contact us via email or phone to request a return</li>
          <li>Provide your order number and reason for return</li>
          <li>Wait for confirmation and return instructions</li>
          <li>Ship the item back in original packaging</li>
        </ol>
      </InfoCard>

      <InfoCard title="Refund Process">
        <p>Once we receive and inspect your returned item:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Refund approval: 2-3 business days</li>
          <li>Credit card refunds: 5-10 business days</li>
          <li>UPI/Net banking: 3-5 business days</li>
        </ul>
      </InfoCard>

      <InfoCard title="Refund Options">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Full refund:</strong> Original payment method
          </li>
          <li>
            <strong>Store credit:</strong> For faster processing
          </li>
          <li>
            <strong>Exchange:</strong> For different products of equal value
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Non-Returnable Items">
        <p>The following items cannot be returned:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Perishable goods (fresh produce, food items)</li>
          <li>Items damaged due to misuse</li>
          <li>Items without original packaging</li>
          <li>Gift cards</li>
        </ul>
      </InfoCard>

      <InfoCard title="Damaged or Defective Items">
        <p>
          If you receive a damaged or defective item, please contact us immediately with photos. We
          will arrange for a replacement or full refund at no additional cost.
        </p>
      </InfoCard>

      <InfoCard title="Shipping Costs">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Defective items:</strong> We cover return shipping
          </li>
          <li>
            <strong>Changed mind:</strong> Customer bears shipping costs
          </li>
          <li>
            <strong>Wrong item sent:</strong> We cover return shipping
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Contact Us">
        <p>
          For refund inquiries, please contact us at{' '}
          <a href="mailto:info@doongooseberry.com" className="text-primary hover:underline">
            info@doongooseberry.com
          </a>
          .
        </p>
      </InfoCard>
    </div>
  );
}
