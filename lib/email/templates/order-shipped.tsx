import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderShippedEmailProps {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  estimatedDelivery: string;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

export const OrderShippedEmail = ({
  orderNumber = 'ABC12345',
  customerName = 'Customer',
  trackingNumber,
  estimatedDelivery = 'January 8, 2024',
  shippingAddress = {
    name: 'John Doe',
    addressLine1: '123 Main Street',
    city: 'Dehradun',
    state: 'Uttarakhand',
    pincode: '248001',
    phone: '9876543210',
  },
}: OrderShippedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Order #{orderNumber} Has Been Shipped - Doon Gooseberry Farm</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>Doon Gooseberry Farm</Heading>
            <Text style={tagline}>Farm Fresh, Naturally Delicious</Text>
          </Section>

          {/* Shipping Message */}
          <Section style={shippingSection}>
            <Text style={shippingIcon}>📦</Text>
            <Heading style={shippingHeading}>Your Order Has Shipped!</Heading>
            <Text style={shippingText}>
              Great news, {customerName}! Your order #{orderNumber} is on its way to you.
            </Text>
          </Section>

          {/* Tracking Information */}
          {trackingNumber && (
            <Section style={trackingSection}>
              <Text style={trackingLabel}>Tracking Number</Text>
              <Text style={trackingNumberStyle}>{trackingNumber}</Text>
              <Text style={trackingNote}>
                You can use this tracking number to monitor your shipment's progress.
              </Text>
            </Section>
          )}

          <Hr style={divider} />

          {/* Estimated Delivery */}
          <Section style={deliverySection}>
            <Heading as="h2" style={sectionHeading}>
              Estimated Delivery
            </Heading>
            <Text style={deliveryText}>
              Your order is expected to arrive by <strong>{estimatedDelivery}</strong>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Shipping Address */}
          <Section>
            <Heading as="h2" style={sectionHeading}>
              Shipping To
            </Heading>
            <Text style={addressText}>{shippingAddress.name}</Text>
            <Text style={addressText}>{shippingAddress.addressLine1}</Text>
            {shippingAddress.addressLine2 && (
              <Text style={addressText}>{shippingAddress.addressLine2}</Text>
            )}
            <Text style={addressText}>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
            </Text>
            <Text style={addressText}>Phone: {shippingAddress.phone}</Text>
          </Section>

          <Hr style={divider} />

          {/* Support Contact */}
          <Section style={supportSection}>
            <Text style={supportText}>
              If you have any questions about your shipment, please contact us:
            </Text>
            <Text style={supportContact}>
              Email:{' '}
              <Link href="mailto:support@doonfarm.com" style={link}>
                support@doonfarm.com
              </Link>
            </Text>
            <Text style={supportContact}>
              Phone:{' '}
              <Link href="tel:+919876543210" style={link}>
                +91 98765 43210
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>© 2024 Doon Gooseberry Farm. All rights reserved.</Text>
            <Text style={footerText}>Farm Fresh Products from the Heart of Uttarakhand</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderShippedEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 40px',
  backgroundColor: '#16a34a',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px',
};

const tagline = {
  fontSize: '14px',
  color: '#dcfce7',
  margin: '0',
};

const shippingSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const shippingIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
};

const shippingHeading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px',
};

const shippingText = {
  fontSize: '16px',
  color: '#6b7280',
  lineHeight: '24px',
  margin: '0',
};

const trackingSection = {
  padding: '24px 40px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '0 40px',
  textAlign: 'center' as const,
};

const trackingLabel = {
  fontSize: '12px',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const trackingNumberStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1f2937',
  fontFamily: 'monospace',
  margin: '0 0 8px',
};

const trackingNote = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 40px',
};

const deliverySection = {
  padding: '0 40px',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px',
  padding: '0 40px',
};

const deliveryText = {
  fontSize: '14px',
  color: '#1f2937',
  lineHeight: '20px',
  margin: '0',
  padding: '0 40px',
};

const addressText = {
  fontSize: '14px',
  color: '#1f2937',
  lineHeight: '20px',
  margin: '0 0 4px',
  padding: '0 40px',
};

const supportSection = {
  padding: '0 40px',
};

const supportText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 12px',
};

const supportContact = {
  fontSize: '14px',
  color: '#1f2937',
  margin: '0 0 4px',
};

const link = {
  color: '#16a34a',
  textDecoration: 'none',
};

const footer = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 4px',
};
