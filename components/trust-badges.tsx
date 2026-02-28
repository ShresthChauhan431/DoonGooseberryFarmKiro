import { CreditCard, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TrustBadges() {
  const badges = [
    {
      icon: Leaf,
      title: '100% Natural',
      description: 'No artificial preservatives or colors',
    },
    {
      icon: Truck,
      title: 'Farm Fresh',
      description: 'Directly from our farm to your home',
    },
    {
      icon: ShieldCheck,
      title: 'Free Shipping above ₹500',
      description: 'Enjoy free delivery on orders over ₹500',
    },
    {
      icon: CreditCard,
      title: 'Secure Checkout',
      description: 'Safe and secure payment processing',
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{badge.title}</h3>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
