'use client';

import { Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateSettings } from '@/lib/actions/settings';
import type { SiteSetting } from '@/lib/queries/settings';
import { SingleImageUpload } from './single-image-upload';

interface HomepageSettingsFormProps {
  settings: SiteSetting[];
}

export function HomepageSettingsForm({ settings }: HomepageSettingsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Parse hero images from JSON or use default
  const heroImagesValue = settings.find((s) => s.key === 'hero_images')?.value;
  const initialImages = heroImagesValue ? JSON.parse(heroImagesValue) : ['/images/hero-bg.jpg'];

  const [heroImages, setHeroImages] = useState<string[]>(initialImages);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const getSettingValue = (key: string, defaultValue: string = '') => {
    return settings.find((s) => s.key === key)?.value || defaultValue;
  };

  const handleAddImage = (url: string) => {
    setHeroImages([...heroImages, url]);
  };

  const handleAddUrl = () => {
    const trimmedUrl = urlInput.trim();

    if (!trimmedUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(trimmedUrl);
      // Check if it's a valid http/https URL
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }

      setHeroImages([...heroImages, trimmedUrl]);
      setUrlInput('');
      setShowUrlInput(false);
      toast({
        title: 'Success',
        description: 'Image URL added successfully',
      });
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid image URL (must start with http:// or https://)',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    if (heroImages.length === 1) {
      toast({
        title: 'Error',
        description: 'You must have at least one hero image',
        variant: 'destructive',
      });
      return;
    }
    setHeroImages(heroImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const settingsToUpdate = [
      { key: 'hero_images', value: JSON.stringify(heroImages), type: 'json', category: 'homepage' },
      { key: 'hero_title', value: formData.get('hero_title') as string, category: 'homepage' },
      {
        key: 'hero_subtitle',
        value: formData.get('hero_subtitle') as string,
        category: 'homepage',
      },
      {
        key: 'hero_button_text',
        value: formData.get('hero_button_text') as string,
        category: 'homepage',
      },
      {
        key: 'hero_button_link',
        value: formData.get('hero_button_link') as string,
        category: 'homepage',
      },
    ];

    const result = await updateSettings(settingsToUpdate);

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Homepage Hero Section</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize the main banner on your homepage. Multiple images will display as a slideshow.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Hero Background Images</Label>

          {/* Image Grid */}
          {heroImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {heroImages.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border group"
                >
                  <Image src={url} alt={`Hero image ${index + 1}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      First Slide
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Image Buttons */}
          <div className="flex gap-2">
            <SingleImageUpload onUploadComplete={handleAddImage} label="Upload Image" />
            <Button type="button" variant="outline" onClick={() => setShowUrlInput(!showUrlInput)}>
              <Plus className="w-4 h-4 mr-2" />
              Add URL
            </Button>
          </div>

          {/* URL Input */}
          {showUrlInput && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter image URL (https://...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
              />
              <Button type="button" onClick={handleAddUrl} size="sm">
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput('');
                }}
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Recommended size: 1920x1080px. Images will auto-rotate every 5 seconds.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_title">Hero Title</Label>
          <Input
            id="hero_title"
            name="hero_title"
            defaultValue={getSettingValue(
              'hero_title',
              'Farm-Fresh Gooseberry Products from the Himalayas'
            )}
            placeholder="Main headline"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero_subtitle"
            name="hero_subtitle"
            defaultValue={getSettingValue(
              'hero_subtitle',
              "Discover our range of 100% natural pickles, chutneys, jams, and more from Uttarakhand's pristine valleys"
            )}
            placeholder="Supporting text"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hero_button_text">Button Text</Label>
            <Input
              id="hero_button_text"
              name="hero_button_text"
              defaultValue={getSettingValue('hero_button_text', 'Shop Now')}
              placeholder="Shop Now"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_button_link">Button Link</Label>
            <Input
              id="hero_button_link"
              name="hero_button_link"
              defaultValue={getSettingValue('hero_button_link', '/shop')}
              placeholder="/shop"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
