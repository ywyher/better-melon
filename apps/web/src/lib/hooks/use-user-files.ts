import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateUser } from "@/lib/db/mutations";
import useUploadFile from "@/lib/hooks/use-upload-file";
import { userQueries } from "@/lib/queries/user";
import { User } from "@/lib/db/schema";

interface UseImageUploadProps {
  userId: User['id'];
  field: 'image' | 'banner';
  successMessage?: string;
}

export default function useUserFiles({ userId, field, successMessage }: UseImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  
  const queryClient = useQueryClient();
  const { handleUpload } = useUploadFile();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    setOpen(true);
  };

  const handleCroppedImage = async (croppedFile: File | null) => {
    if (!croppedFile) return;
    
    setIsUploading(true);
    setOpen(false);

    try {
      const { error, url } = await handleUpload({
        file: croppedFile,
        options: {
          acceptedTypes: ['images'],
          maxSize: 5
        }
      });

      if (error || !url) {
        throw new Error(error || "Url missing");
      }
      
      const updateData = field === 'banner' ? { banner: url } : { image: url };
      const { error: userError } = await updateUser({ 
        data: updateData,
        userId
      });
      
      if (userError) {
        throw new Error(userError);
      }
      
      toast.success(successMessage || `${field} updated successfully!`);
      queryClient.invalidateQueries({ queryKey: userQueries.session._def });
      
      cleanup();
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to upload ${field}`;
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    cleanup();
  };

  const cleanup = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    fileInputRef,
    previewUrl,
    selectedFile,
    isUploading,
    open,
    handleFileChange,
    handleCroppedImage,
    handleDialogClose,
    triggerFileInput
  };
}