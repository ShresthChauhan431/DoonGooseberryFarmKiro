import { InfoCard } from '@/components/info/info-card';

export const metadata = {
  title: 'Privacy Policy - Doon Gooseberry Farm',
  description: 'Our privacy policy explains how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().getFullYear()}</p>
      </div>

      <InfoCard title="Information We Collect">
        <p>We collect information you provide directly to us, including:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Name and contact information</li>
          <li>Shipping and billing addresses</li>
          <li>Payment information</li>
          <li>Order history</li>
          <li>Communications with us</li>
        </ul>
      </InfoCard>

      <InfoCard title="How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Process and fulfill your orders</li>
          <li>Communicate with you about your orders</li>
          <li>Provide customer support</li>
          <li>Improve our products and services</li>
          <li>Comply with legal obligations</li>
        </ul>
      </InfoCard>

      <InfoCard title="Information Sharing">
        <p>
          We do not sell, trade, or otherwise transfer your personal information to outside parties
          except:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Trusted third parties who assist in operating our website</li>
          <li>Shipping partners for order delivery</li>
          <li>Payment processors for transaction handling</li>
          <li>When required by law</li>
        </ul>
      </InfoCard>

      <InfoCard title="Data Security">
        <p>
          We implement appropriate security measures to protect your personal information. However,
          no method of transmission over the Internet is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      </InfoCard>

      <InfoCard title="Cookies">
        <p>
          We use cookies to enhance your browsing experience. You can choose to disable cookies
          through your browser settings, but this may affect your ability to use some features of
          our website.
        </p>
      </InfoCard>

      <InfoCard title="Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
      </InfoCard>

      <InfoCard title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:info@doongooseberry.com" className="text-primary hover:underline">
            info@doongooseberry.com
          </a>
          .
        </p>
      </InfoCard>
    </div>
  );
}
