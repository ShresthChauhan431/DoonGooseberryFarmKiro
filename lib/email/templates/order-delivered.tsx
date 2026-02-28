import {
  Body,
  Button,
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

interface OrderDeliveredEmailProps {
  orderNumber: string;
  customerName: string;
  deliveryDate: string;
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

export const OrderDeliveredEmail = ({
  orderNumber = 'ABC12345',
  customerName = 'Customer',
  deliveryDate = 'January 8, 2024',
  shippingAddress = {
    name: 'John Doe',
    addressLine1: '123 Main Street',
    city: 'Dehradun',
    state: 'Uttarakhand',
    pincode: '248001',
    phone: '9876543210',
  },
}: OrderDeliveredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Order #{orderNumber} Has Been Delivered - Doon Gooseberry Farm</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>Doon Gooseberry Farm</Heading>
            <Text style={tagline}>Farm Fresh, Naturally Delicious</Text>
          </Section>

          {/* Delivery Message */}
          <Section style={deliverySection}>
            <Text style={deliveryIcon}>✓</Text>
            <Heading style={deliveryHeading}>Order Delivered!</Heading>
            <Text style={deliveryText}>
              Great news, {customerName}! Your order #{orderNumber} has been successfully delivered
              on {deliveryDate}.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Delivery Address */}
          <Section>
            <Heading as="h2" style={sectionHeading}>
              Delivered To
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

          {/* Feedback Request */}
          <Section style={feedbackSection}>
            <Heading as="h2" style={sectionHeading}>
              How Was Your Experience?
            </Heading>
            <Text style={feedbackText}>
              We hope you enjoy your farm-fresh products! Your feedback helps us serve you better.
              Please take a moment to share your thoughts about your order.
            </Text>
            <Section style={buttonContainer}>
              <Button href="https://doonfarm.com/account/orders" style={button}>
                Write a Review
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Quality Assurance */}
          <Section style={qualitySection}>
            <Heading as="h2" style={sectionHeading}>
              Quality Guarantee
            </Heading>
            <Text style={qualityText}>
              All our products are made with 100% natural ingredients and no preservatives. If
              you're not completely satisfied with your order, please contact us within 7 days of
              delivery.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Support Contact */}
          <Section style={supportSection}>
            <Text style={supportText}>
              If you have any questions or concerns about your order, please contact us:
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
            <Text style={footerText}>Thank you for choosing Doon Gooseberry Farm!</Text>
            <Text style={footerText}>© 2024 Doon Gooseberry Farm. All rights reserved.</Text>
            <Text style={footerText}>Farm Fresh Products from the Heart of Uttarakhand</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderDeliveredEmail;

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

const deliverySection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const deliveryIcon = {
  fontSize: '48px',
  color: '#16a34a',
  margin: '0 0 16px',
};

const deliveryHeading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px',
};

const deliveryText = {
  fontSize: '16px',
  color: '#6b7280',
  lineHeight: '24px',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 40px',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px',
  padding: '0 40px',
};

const addressText = {
  fontSize: '14px',
  color: '#1f2937',
  lineHeight: '20px',
  margin: '0 0 4px',
  padding: '0 40px',
};

const feedbackSection = {
  padding: '0 40px',
};

const feedbackText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '20px',
  margin: '0 0 20px',
  padding: '0 40px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '0 40px',
};

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const qualitySection = {
  padding: '0 40px',
};

const qualityText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '20px',
  margin: '0',
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
