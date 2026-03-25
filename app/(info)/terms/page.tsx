import { InfoCard } from '@/components/info/info-card';

export const metadata = {
  title: 'Terms of Service - Doon Gooseberry Farm',
  description: 'Terms and conditions for using our website and services.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().getFullYear()}</p>
      </div>

      <InfoCard title="Acceptance of Terms">
        <p>
          By accessing and using this website, you accept and agree to be bound by the terms and
          provision of this agreement.
        </p>
      </InfoCard>

      <InfoCard title="Use License">
        <p>
          Permission is granted to temporarily use this website for personal, non-commercial use
          only. This is the grant of a license, not a transfer of title.
        </p>
      </InfoCard>

      <InfoCard title="User Accounts">
        <p>When you create an account on our website, you must:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account</li>
          <li>Promptly update any changes to your information</li>
          <li>Accept responsibility for all activities under your account</li>
        </ul>
      </InfoCard>

      <InfoCard title="Orders and Payments">
        <p>By placing an order through our website, you agree to:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Provide valid payment information</li>
          <li>Pay all charges incurred by your account</li>
          <li>Accept delivery at the provided address</li>
        </ul>
      </InfoCard>

      <InfoCard title="Product Information">
        <p>
          We strive to accurately display our products. However, we cannot guarantee that product
          descriptions, images, or other content is accurate, complete, or error-free.
        </p>
      </InfoCard>

      <InfoCard title="Prohibited Uses">
        <p>You may not use our website to:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Violate any applicable laws or regulations</li>
          <li>Submit false or misleading information</li>
          <li>Engage in any unlawful purpose</li>
          <li>Attempt to interfere with the proper functioning of the site</li>
        </ul>
      </InfoCard>

      <InfoCard title="Limitation of Liability">
        <p>
          Doon Gooseberry Farm shall not be liable for any indirect, incidental, special, or
          consequential damages arising out of the use of this website.
        </p>
      </InfoCard>

      <InfoCard title="Governing Law">
        <p>
          These terms and conditions are governed by the laws of India. Any disputes shall be
          subject to the jurisdiction of courts in Dehradun, Uttarakhand.
        </p>
      </InfoCard>

      <InfoCard title="Contact Us">
        <p>
          If you have any questions about these Terms of Service, please contact us at{' '}
          <a href="mailto:info@doongooseberry.com" className="text-primary hover:underline">
            info@doongooseberry.com
          </a>
          .
        </p>
      </InfoCard>
    </div>
  );
}
