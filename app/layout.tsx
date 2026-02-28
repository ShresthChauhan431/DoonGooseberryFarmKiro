import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { WishlistMerge } from '@/components/wishlist-merge';
import { getSession } from '@/lib/auth/session';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: {
    default: 'Doon Gooseberry Farm - Farm Fresh Products from Uttarakhand',
    template: '%s | Doon Gooseberry Farm',
  },
  description:
    'Shop authentic farm-fresh pickles, chutneys, jams, juices, candies, and spices from Doon Gooseberry Farm in Uttarakhand. 100% natural products delivered to your doorstep.',
  keywords: [
    'gooseberry',
    'farm products',
    'pickles',
    'chutneys',
    'jams',
    'uttarakhand',
    'organic',
    'natural',
  ],
  authors: [{ name: 'Doon Gooseberry Farm' }],
  creator: 'Doon Gooseberry Farm',
  publisher: 'Doon Gooseberry Farm',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Doon Gooseberry Farm',
    title: 'Doon Gooseberry Farm - Farm Fresh Products from Uttarakhand',
    description:
      'Shop authentic farm-fresh pickles, chutneys, jams, juices, candies, and spices from Doon Gooseberry Farm in Uttarakhand.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Doon Gooseberry Farm',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doon Gooseberry Farm - Farm Fresh Products from Uttarakhand',
    description:
      'Shop authentic farm-fresh pickles, chutneys, jams, juices, candies, and spices from Doon Gooseberry Farm in Uttarakhand.',
    images: ['/og-image.jpg'],
    creator: '@doongooseberryfarm',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
        {session?.user && <WishlistMerge />}
      </body>
    </html>
  );
}
