'use client';

import { ImageIcon, Link2, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/storage/upload';

interface ImageInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export function ImageInput({
  value,
  onChange,
  label = 'Featured Image',
  required = false,
}: ImageInputProps) {
  const [mode, setMode] = useState<'upload' | 'url'>(() =>
    value.startsWith('http') ? 'url' : 'upload'
  );
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value.startsWith('http') ? value : '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleModeChange = (newMode: 'upload' | 'url') => {
    if (mode !== newMode) {
      setMode(newMode);
      onChange('');
      setUrlInput('');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (jpg, png, webp)',
        variant: 'destructive',
      });
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Image size must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const result = await uploadImage(file);

      if (result.success && result.url) {
        onChange(result.url);
        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: result.error || 'Failed to upload image',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    try {
      new URL(urlInput);
      onChange(urlInput.trim());
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid image URL',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Tabs value={mode} onValueChange={(v) => handleModeChange(v as 'upload' | 'url')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <Link2 className="w-4 h-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {value && !value.startsWith('http') ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
              <Image
                src={value}
                alt="Featured image preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full h-32"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Image
                </>
              )}
            </Button>
          )}

          <p className="text-sm text-muted-foreground">
            Supported formats: JPG, PNG, WebP. Max size: 2MB.
          </p>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
            />
            <Button type="button" onClick={handleUrlSubmit}>
              Apply
            </Button>
          </div>

          {value?.startsWith('http') ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
              <Image
                src={value}
                alt="Featured image preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
                onError={() => {
                  toast({
                    title: 'Image Error',
                    description: 'Failed to load image from URL',
                    variant: 'destructive',
                  });
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Enter an image URL above and click Apply
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
