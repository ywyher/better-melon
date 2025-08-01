import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/actions/catbox';

interface UploadResult {
  message: string | null;
  error: string | null;
  url: string | null;
}

// Predefined file type options
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
}

export default function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = useCallback(async ({ file, options = {} }: {
    file: File, 
    options: UploadOptions
  }): Promise<UploadResult> => {
    const { 
      acceptedTypes = FILE_TYPES.IMAGES, 
      maxSize = 2 
    } = options;

    if (acceptedTypes.length > 0) {
      const isValidType = acceptedTypes.some(type => file.type.startsWith(type));
      if (!isValidType) {
        const typeNames = acceptedTypes
          .map(type => type.replace('/', '').replace('application/', ''))
          .join(', ');
        toast.error(`Please select a valid file type (${typeNames})`);
        return { message: null, error: 'Invalid file type', url: null };
      }
    }

    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size should be less than ${maxSize}MB`);
      return { message: null, error: 'File too large', url: null };
    }

    setIsUploading(true);
    
    try {
      const uploadResult = await uploadFile(file);
      
      toast.promise(
        Promise.resolve(uploadResult),
        {
          loading: 'Uploading...',
          success: 'Upload successful!',
          error: 'Upload failed'
        }
      );
      
      return {
        message: 'File uploaded!',
        error: null,
        url: uploadResult.url || ''
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      toast.error(errorMessage);
      return {
        message: null,
        error: errorMessage,
        url: null
      };
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    handleUpload,
    isUploading,
  };
}