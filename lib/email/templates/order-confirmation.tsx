import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  estimatedDelivery: string;
}

export const OrderConfirmationEmail = ({
  orderNumber = 'ABC12345',
  customerName = 'Customer',
  orderDate = 'January 1, 2024',
  items = [
    {
      name: 'Amla Pickle',
      quantity: 2,
      price: 29900,
      image: 'https://via.placeholder.com/80',
    },
  ],
  subtotal = 59800,
  shipping = 5000,
  discount = 0,
  total = 64800,
  shippingAddress = {
    name: 'John Doe',
    addressLine1: '123 Main Street',
    city: 'Dehradun',
    state: 'Uttarakhand',
    pincode: '248001',
    phone: '9876543210',
  },
  estimatedDelivery = 'January 8, 2024',
}: OrderConfirmationEmailProps) => {
  const formatPrice = (paise: number) => {
    const rupees = paise / 100;
    return `₹${rupees.toFixed(2)}`;
  };

  return (
    <Html>
      <Head />
      <Preview>Order Confirmation - Order #{orderNumber} - Doon Gooseberry Farm</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>Doon Gooseberry Farm</Heading>
            <Text style={tagline}>Farm Fresh, Naturally Delicious</Text>
          </Section>

          {/* Success Message */}
          <Section style={successSection}>
            <Text style={successIcon}>✓</Text>
            <Heading style={successHeading}>Order Confirmed!</Heading>
            <Text style={successText}>
              Thank you for your order, {customerName}! We've received your payment and will start
              processing your order soon.
            </Text>
          </Section>

          {/* Order Details */}
          <Section style={orderDetailsSection}>
            <Row>
              <Column>
                <Text style={label}>Order Number</Text>
                <Text style={value}>#{orderNumber}</Text>
              </Column>
              <Column align="right">
                <Text style={label}>Order Date</Text>
                <Text style={value}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Order Items */}
          <Section>
            <Heading as="h2" style={sectionHeading}>
              Order Items
            </Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemImageColumn}>
                  <Img src={item.image} alt={item.name} width="80" height="80" style={itemImage} />
                </Column>
                <Column style={itemDetailsColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Quantity: {item.quantity}</Text>
                </Column>
                <Column align="right" style={itemPriceColumn}>
                  <Text style={itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Order Summary */}
          <Section>
            <Heading as="h2" style={sectionHeading}>
              Order Summary
            </Heading>
            <Row style={summaryRow}>
              <Column>
                <Text style={summaryLabel}>Subtotal</Text>
              </Column>
              <Column align="right">
                <Text style={summaryValue}>{formatPrice(subtotal)}</Text>
              </Column>
            </Row>
            <Row style={summaryRow}>
              <Column>
                <Text style={summaryLabel}>Shipping</Text>
              </Column>
              <Column align="right">
                <Text style={summaryValue}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</Text>
              </Column>
            </Row>
            {discount > 0 && (
              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Discount</Text>
                </Column>
                <Column align="right">
                  <Text style={discountValue}>-{formatPrice(discount)}</Text>
                </Column>
              </Row>
            )}
            <Hr style={divider} />
            <Row style={summaryRow}>
              <Column>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>{formatPrice(total)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Shipping Address */}
          <Section>
            <Heading as="h2" style={sectionHeading}>
              Shipping Address
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

          {/* Estimated Delivery */}
          <Section>
            <Heading as="h2" style={sectionHeading}>
              Estimated Delivery
            </Heading>
            <Text style={deliveryText}>
              Your order is expected to arrive by <strong>{estimatedDelivery}</strong>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Support Contact */}
          <Section style={supportSection}>
            <Text style={supportText}>
              If you have any questions about your order, please contact us:
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

export default OrderConfirmationEmail;

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

const successSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const successIcon = {
  fontSize: '48px',
  color: '#16a34a',
  margin: '0 0 16px',
};

const successHeading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px',
};

const successText = {
  fontSize: '16px',
  color: '#6b7280',
  lineHeight: '24px',
  margin: '0',
};

const orderDetailsSection = {
  padding: '0 40px',
};

const label = {
  fontSize: '12px',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const value = {
  fontSize: '16px',
  color: '#1f2937',
  fontWeight: '600',
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

const itemRow = {
  padding: '16px 40px',
};

const itemImageColumn = {
  width: '80px',
  paddingRight: '16px',
};

const itemImage = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
};

const itemDetailsColumn = {
  verticalAlign: 'top' as const,
};

const itemName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 4px',
};

const itemQuantity = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const itemPriceColumn = {
  verticalAlign: 'top' as const,
};

const itemPrice = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0',
};

const summaryRow = {
  padding: '8px 40px',
};

const summaryLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const summaryValue = {
  fontSize: '14px',
  color: '#1f2937',
  margin: '0',
};

const discountValue = {
  fontSize: '14px',
  color: '#16a34a',
  margin: '0',
};

const totalLabel = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
};

const totalValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
};

const addressText = {
  fontSize: '14px',
  color: '#1f2937',
  lineHeight: '20px',
  margin: '0 0 4px',
  padding: '0 40px',
};

const deliveryText = {
  fontSize: '14px',
  color: '#1f2937',
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
