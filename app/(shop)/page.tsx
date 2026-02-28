import Link from 'next/link';
import { CategoryGrid } from '@/components/category-grid';
import { HeroCarousel } from '@/components/hero-carousel';
import { NewsletterForm } from '@/components/newsletter-form';
import { FeaturedCarousel } from '@/components/product/featured-carousel';
import { Testimonials } from '@/components/testimonials';
import { TrustBadges } from '@/components/trust-badges';
import { getHomepageSettings } from '@/lib/queries/settings';

export default async function Home() {
  const homepageSettings = await getHomepageSettings();
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Doon Gooseberry Farm',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
    description:
      'Farm-fresh gooseberry products from Uttarakhand including pickles, chutneys, jams, juices, candies, and spices',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dehradun',
      addressRegion: 'Uttarakhand',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'Customer Service',
      email: 'contact@doongooseberryfarm.com',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://facebook.com/doongooseberryfarm',
      'https://instagram.com/doongooseberryfarm',
      'https://twitter.com/doongooseberryfarm',
    ],
  };

  return (
    <div className="min-h-screen">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Hero Section with Carousel */}
      <HeroCarousel
        images={homepageSettings.heroImages}
        title={homepageSettings.heroTitle}
        subtitle={homepageSettings.heroSubtitle}
        buttonText={homepageSettings.heroButtonText}
        buttonLink={homepageSettings.heroButtonLink}
      />

      {/* Featured Products Carousel */}
      <FeaturedCarousel />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Testimonials */}
      <Testimonials />

      {/* Newsletter Form */}
      <NewsletterForm />
    </div>
  );
}
