import { Mail, MapPin, Phone } from 'lucide-react';
import { InfoCard } from '@/components/info/info-card';

export const metadata = {
  title: 'Contact Us - Doon Gooseberry Farm',
  description: 'Get in touch with us for any inquiries or support.',
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground mt-2">
          We&apos;d love to hear from you. Get in touch with us for any questions or support.
        </p>
      </div>

      <InfoCard title="Get in Touch">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <h4 className="font-medium">Farm Address</h4>
              <p className="text-muted-foreground">
                Doon Gooseberry Farm
                <br />
                Dehradun, Uttarakhand
                <br />
                India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <h4 className="font-medium">Phone</h4>
              <p className="text-muted-foreground">+91 1234567890</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <h4 className="font-medium">Email</h4>
              <p className="text-muted-foreground">info@doongooseberry.com</p>
            </div>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Business Hours">
        <ul className="space-y-2">
          <li>
            <strong>Monday - Saturday:</strong> 9:00 AM - 6:00 PM
          </li>
          <li>
            <strong>Sunday:</strong> Closed
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Send us a Message">
        <p className="text-muted-foreground">
          For any inquiries, please email us at{' '}
          <a href="mailto:info@doongooseberry.com" className="text-primary hover:underline">
            info@doongooseberry.com
          </a>
          . We typically respond within 24-48 hours.
        </p>
      </InfoCard>
    </div>
  );
}
