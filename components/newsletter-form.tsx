'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { subscribeNewsletter } from '@/lib/actions/newsletter';

export function NewsletterForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await subscribeNewsletter(formData);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);

      // Reset form if successful
      if (result.success) {
        const form = document.getElementById('newsletter-form') as HTMLFormElement;
        form?.reset();
      }
    });
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
              <p className="text-gray-600">
                Get updates about new products, special offers, and farm stories
              </p>
            </div>
            <form
              id="newsletter-form"
              action={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                disabled={isPending}
                className="flex-1"
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            {message && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
