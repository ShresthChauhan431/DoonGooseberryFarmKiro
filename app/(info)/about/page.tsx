import { InfoCard } from '@/components/info/info-card';

export const metadata = {
  title: 'About Us - Doon Gooseberry Farm',
  description: 'Learn about Doon Gooseberry Farm and our commitment to organic products.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">About Us</h1>
        <p className="text-muted-foreground mt-2">
          Farm Fresh Products from the Heart of Uttarakhand
        </p>
      </div>

      <InfoCard title="Our Story">
        <p>
          Welcome to Doon Gooseberry Farm, a family-owned organic farm nestled in the beautiful
          hills of Dehradun, Uttarakhand. We are passionate about bringing you the finest quality
          gooseberry products while maintaining sustainable farming practices.
        </p>
        <p className="mt-2">
          Our journey began with a simple mission: to provide pure, natural, and organic gooseberry
          products that promote health and wellness.
        </p>
      </InfoCard>

      <InfoCard title="Our Products">
        <p>We offer a wide range of organic products including:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Fresh Gooseberries (Amla)</li>
          <li>Amla Juice</li>
          <li>Amla Powder</li>
          <li>Amla Candy</li>
          <li>Amla Pickle</li>
          <li>Organic Honey</li>
          <li>Herbal Teas</li>
        </ul>
      </InfoCard>

      <InfoCard title="Our Commitment">
        <p>We are committed to:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>100% Organic farming practices</li>
          <li>Sustainable agriculture</li>
          <li>Natural processing methods</li>
          <li>Fair trade practices</li>
          <li>Customer satisfaction</li>
        </ul>
      </InfoCard>

      <InfoCard title="Why Choose Us?">
        <ul className="list-disc pl-6 space-y-1">
          <li>Certified organic products</li>
          <li>Farm-fresh quality</li>
          <li>Traditional recipes with modern packaging</li>
          <li>Pan-India delivery</li>
          <li>Responsive customer support</li>
        </ul>
      </InfoCard>

      <InfoCard title="Our Location">
        <p>
          We are based in Dehradun, Uttarakhand - known for its pristine natural beauty and ideal
          climate for growing amla (Indian gooseberry).
        </p>
      </InfoCard>

      <InfoCard title="Contact Us">
        <p>
          We would love to hear from you! Reach out to us at{' '}
          <a href="mailto:info@doongooseberry.com" className="text-primary hover:underline">
            info@doongooseberry.com
          </a>{' '}
          or call us at +91 1234567890.
        </p>
      </InfoCard>
    </div>
  );
}
