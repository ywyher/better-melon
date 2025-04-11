import { getFileUrl } from "@/lib/utils";
import { useState, useRef } from "react";
import { toast } from "sonner";

// Valid file types with their max sizes
const fileTypeConfigs = {
  // Images: 4MB
  "image/jpeg": 4 * 1024 * 1024,
  "image/png": 4 * 1024 * 1024,
  "image/gif": 4 * 1024 * 1024,
  "image/webp": 4 * 1024 * 1024,
  // PDFs: 10MB
  "application/pdf": 10 * 1024 * 1024,
  // Word documents: 10MB
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10 * 1024 * 1024,
  // Videos: 10MB
  "video/mp4": 10 * 1024 * 1024,
  // Audio files: 10MB
  "audio/mpeg": 10 * 1024 * 1024,
  "audio/mp3": 10 * 1024 * 1024,
  // Add other file types as needed
};

// File validation helper
const validateFile = (file: File): string | null => {
  if (!fileTypeConfigs[file.type as keyof typeof fileTypeConfigs]) {
    return `File type ${file.type} is not supported`;
  }
  
  const maxSize = fileTypeConfigs[file.type as keyof typeof fileTypeConfigs];
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return `File is too large. Maximum size for ${file.type} is ${maxSizeMB}MB`;
  }
  
  return null;
};

async function computeSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export interface UploadedFile {
    key: string;    // Unique identifier
    url: string;    // Public URL of the uploaded file
    name: string;   // Original filename
    size: number;   // File size in bytes
    type: string;   // MIME type
}

export function useUploadFile() {
  // Track progress for multiple files by unique ID
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Store active XHR requests to support cancellation
  const activeUploads = useRef<Record<string, XMLHttpRequest>>({});

  const getPreSignedUrl = async (
    type: string,
    size: number,
    checksum: string,
  ): Promise<UploadedFile> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/presigned-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, size, checksum }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error occurred" }));
        const errorMessage = errorData.message || `Request failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error("Failed to get upload URL");
    }
  };

  const cancelUpload = (fileId: string): boolean => {
    const xhr = activeUploads.current[fileId];
    if (xhr) {
      xhr.abort();
      delete activeUploads.current[fileId];
      setProgresses((prev) => {
        const newProgresses = { ...prev };
        delete newProgresses[fileId];
        return newProgresses;
      });
      return true;
    }
    return false;
  };

  const cancelAllUploads = (): void => {
    Object.keys(activeUploads.current).forEach(cancelUpload);
  };

  const handleUpload = async (file: File): Promise<UploadedFile & { error?: string }> => {
    // Client-side validation before starting upload
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return {
        key: '',
        url: '',
        name: file.name,
        size: file.size,
        type: file.type,
        error: validationError
      };
    }

    setIsUploading(true);
    // Generate a unique ID for this upload
    const fileId = `${file.name}-${Date.now()}`;
    setProgresses((prev) => ({ ...prev, [fileId]: 0 }));

    try {
      const checksum = await computeSHA256(file);

      const { url, name, size, key, type } = await getPreSignedUrl(
        file.type,
        file.size,
        checksum,
      );

      const xhr = new XMLHttpRequest();
      // Store the XHR for potential cancellation
      activeUploads.current[fileId] = xhr;
      
      xhr.open("PUT", url);
      
      // Set appropriate headers
      xhr.setRequestHeader("Content-Type", file.type);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgresses((prev) => ({ ...prev, [fileId]: percentComplete }));
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          // Cleanup the active upload
          delete activeUploads.current[fileId];
          
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgresses((prev) => ({ ...prev, [fileId]: 100 }));
            resolve();
          } else {
            const errorMessage = `Upload failed with status ${xhr.status}`;
            reject(new Error(errorMessage));
          }
        };
        
        xhr.onerror = () => {
          // Cleanup the active upload
          delete activeUploads.current[fileId];
          reject(new Error("Network error occurred during upload"));
        };
        
        xhr.onabort = () => {
          // Cleanup the active upload
          delete activeUploads.current[fileId];
          reject(new Error("Upload was cancelled"));
        };
        
        xhr.send(file);
      });

      return {
        key,    
        url: getFileUrl(name),
        name,   
        size,
        type,   
      };
    } catch (error: unknown) {
      // Clean up the progress for failed uploads
      setProgresses((prev) => {
        const newProgresses = { ...prev };
        delete newProgresses[fileId];
        return newProgresses;
      });
      
      // Show toast error if not due to cancellation
      if (error instanceof Error && error.message !== "Upload was cancelled") {
        toast.error(error.message || "Failed to upload file");
      }
      
      return {
        key: '',
        url: '',
        name: file.name,
        size: file.size,
        type: file.type,
        error: error instanceof Error ? error.message : "Failed to upload file"
      };
    } finally {
      // Only set isUploading to false if no uploads are in progress
      if (Object.keys(activeUploads.current).length === 0) {
        setIsUploading(false);
      }
    }
  };

  // Alternative: Handle multiple files upload in parallel
  const handleBatchUpload = async (files: File[]): Promise<(UploadedFile & { error?: string })[]> => {
    const uploadPromises = files.map(file => handleUpload(file));
    return Promise.all(uploadPromises);
  };

  return {
    handleUpload,
    handleBatchUpload,
    cancelUpload,
    cancelAllUploads,
    progresses,
    isUploading,
    setProgresses,
    setIsUploading,
  };
}