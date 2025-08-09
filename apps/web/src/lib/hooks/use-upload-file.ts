import ky from 'ky';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { CatboxUploadResponse } from '@/types/catbox'

interface UploadResult {
  message: string | null;
  error: string | null;
  url: string | null;
}

export const FILE_TYPES = {
  IMAGES: ['image/'],
  VIDEOS: ['video/'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AUDIO: ['audio/'],
  ALL: [],
} as const;

interface UploadOptions {
  acceptedTypes?: ("images" | "videos" | "documents" | "audio" | 'all')[];
  maxSize?: number;
  maxRetries?: number;
}

const validateImageFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(true); // Skip validation for non-images
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    
    img.src = url;
  });
};

// Helper function to compress image if it's too large or corrupted
const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback to original file
        }
      }, file.type, quality);
    };
    
    img.onerror = () => resolve(file); // Fallback to original file
    img.src = URL.createObjectURL(file);
  });
};

export default function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async ({ 
    file, 
    options = {} 
  }: {
    file: File,
    options: UploadOptions
  }): Promise<UploadResult> => {
    const {
      acceptedTypes = ['images'],
      maxSize = 5,
      maxRetries = 2
    } = options;

    const resolvedAcceptedTypes = acceptedTypes
      .flatMap(typeKey => FILE_TYPES[typeKey.toUpperCase() as keyof typeof FILE_TYPES]);

    if (resolvedAcceptedTypes.length > 0) {
      const isValidType = resolvedAcceptedTypes.some(type => file.type.startsWith(type));
      if (!isValidType) {
        return { message: null, error: 'Invalid file type', url: null };
      }
    }

    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { message: null, error: 'File too large', url: null };
    }

    // Validate image integrity
    const isValidImage = await validateImageFile(file);
    if (!isValidImage) {
      return { message: null, error: 'Image file is corrupted or invalid', url: null };
    }

    setIsUploading(true);

    let currentFile = file;
    let lastError = '';

    // Retry logic with different approaches
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // On retry, try compressing the image
        if (attempt > 0 && file.type.startsWith('image/')) {
          console.log(`Attempt ${attempt + 1}: Compressing image with quality ${0.9 - (attempt * 0.1)}`);
          currentFile = await compressImage(file, 0.9 - (attempt * 0.1));
        }

        const formData = new FormData();
        formData.append('file', currentFile);

        const uploadPromise = ky.post<CatboxUploadResponse>(`/api/catbox`, {
          body: formData,
          timeout: 30000, // 30 second timeout
        });

        if (attempt === 0) {
          toast.promise(uploadPromise, {
            loading: 'Uploading...',
          });
        } else {
          toast.loading(`Retrying upload... (${attempt + 1}/${maxRetries + 1})`);
        }

        const result = await uploadPromise.json();

        // console.log({
        //   attempt: attempt + 1,
        //   result,
        //   fileSize: currentFile.size,
        //   originalSize: file.size
        // });

        // Validate the response
        if (!result.success) {
          lastError = result.error || 'Upload failed on server';
          if (attempt === maxRetries) {
            toast.dismiss();
            return {
              message: null,
              error: lastError,
              url: null
            };
          }
          continue; // Retry
        }

        // Check if URL is valid and not empty
        if (!result.url || result.url.trim() === '') {
          lastError = 'Server returned empty URL - file may be corrupted';
          if (attempt === maxRetries) {
            toast.dismiss();
            return {
              message: null,
              error: lastError,
              url: null
            };
          }
          continue; // Retry
        }

        // Validate URL format
        try {
          new URL(result.url);
        } catch {
          lastError = 'Server returned invalid URL format';
          if (attempt === maxRetries) {
            toast.dismiss();
            return {
              message: null,
              error: lastError,
              url: null
            };
          }
          continue; // Retry
        }

        toast.dismiss();

        return {
          message: 'File uploaded!',
          error: null,
          url: result.url
        };

      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Upload failed';
        console.error(`Upload attempt ${attempt + 1} failed:`, err);
        
        if (attempt === maxRetries) {
          toast.dismiss();
          break; // Exit retry loop
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return {
      message: null,
      error: lastError || 'Upload failed after multiple attempts',
      url: null
    };
  }, []);

  return {
    handleUpload,
    isUploading,
  };
}