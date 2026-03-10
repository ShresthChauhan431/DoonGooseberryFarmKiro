'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SalesBannerProps {
  text: string;
  link?: string;
  bgColor: string;
  textColor: string;
}

export function SalesBanner({ text, link, bgColor, textColor }: SalesBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const content = (
    <div
      className="relative py-3 px-4 text-center font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <p className="text-sm md:text-base">{text}</p>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-black/10"
        onClick={() => setIsVisible(false)}
        style={{ color: textColor }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  if (link?.trim()) {
    return (
      <Link href={link} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
