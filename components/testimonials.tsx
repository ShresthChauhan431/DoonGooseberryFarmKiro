import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Priya Sharma',
      rating: 5,
      comment:
        "The mango pickle is absolutely delicious! Reminds me of my grandmother's homemade pickles. Will definitely order again.",
    },
    {
      name: 'Rajesh Kumar',
      rating: 5,
      comment:
        'Best quality products! The gooseberry juice is so fresh and healthy. Great for the whole family.',
    },
    {
      name: 'Anita Verma',
      rating: 5,
      comment:
        "Love the strawberry jam! It's so natural and tasty. Perfect for breakfast toast. Highly recommended!",
    },
    {
      name: 'Vikram Singh',
      rating: 4,
      comment:
        'Excellent farm products with authentic taste. The packaging is also very good. Fast delivery too!',
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-sm">"{testimonial.comment}"</p>
                <p className="font-semibold text-sm">{testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
