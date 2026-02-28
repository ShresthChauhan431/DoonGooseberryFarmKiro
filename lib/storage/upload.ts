/**
 * Image upload utilities for product images
 * Supports Vercel Blob storage with fallback to local storage
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload an image file to storage
 * This is a placeholder implementation that should be replaced with actual storage integration
 *
 * For production, integrate with:
 * - Vercel Blob: https://vercel.com/docs/storage/vercel-blob
 * - Cloudflare R2: https://developers.cloudflare.com/r2/
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 5MB',
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Upload to API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image',
    };
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(files: File[]): Promise<UploadResult[]> {
  const uploads = files.map((file) => uploadImage(file));
  return Promise.all(uploads);
}

/**
 * Delete an image from storage
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    return response.ok;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
