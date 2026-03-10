import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface VerifyEmailProps {
  userName: string;
  verificationUrl: string;
}

export const VerifyEmail = ({
  userName = 'Customer',
  verificationUrl = 'https://example.com/verify',
}: VerifyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address - Doon Gooseberry Farm</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>Doon Gooseberry Farm</Heading>
            <Text style={tagline}>Farm Fresh, Naturally Delicious</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hello {userName},</Text>

            <Text style={paragraph}>
              Thank you for creating an account with Doon Gooseberry Farm! Please verify your email
              address by clicking the button below.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={paragraph}>
              If you didn&apos;t create an account with us, you can safely ignore this email.
            </Text>

            <Text style={expiryNote}>This verification link will expire in 24 hours.</Text>

            <Text style={linkFallback}>
              If the button above doesn&apos;t work, copy and paste this URL into your browser:
            </Text>
            <Text style={linkText}>{verificationUrl}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Doon Gooseberry Farm. All rights reserved.
            </Text>
            <Text style={footerText}>Dehradun, Uttarakhand, India</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden' as const,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
};

const header = {
  backgroundColor: '#16a34a',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const heading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  margin: '0',
  padding: '0',
};

const tagline = {
  color: '#bbf7d0',
  fontSize: '14px',
  margin: '8px 0 0 0',
};

const content = {
  padding: '40px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#1a1a1a',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#4a4a4a',
  margin: '0 0 20px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 32px',
  display: 'inline-block' as const,
};

const expiryNote = {
  fontSize: '13px',
  color: '#888888',
  fontStyle: 'italic' as const,
  margin: '0 0 24px 0',
};

const linkFallback = {
  fontSize: '13px',
  color: '#666666',
  margin: '0 0 4px 0',
};

const linkText = {
  fontSize: '12px',
  color: '#16a34a',
  wordBreak: 'break-all' as const,
  margin: '0 0 0 0',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px 40px',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
  lineHeight: '1.6',
};
