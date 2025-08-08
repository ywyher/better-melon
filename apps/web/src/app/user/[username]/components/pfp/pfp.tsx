"use client"

import Pfp from "@/components/pfp";
import Cropper from "@/components/cropper";
import DialogWrapper from "@/components/dialog-wrapper";
import useUploadFile from "@/lib/hooks/use-upload-file";
import { User } from "@/lib/db/schema";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { updateUser } from "@/lib/db/mutations";
import { userQueries } from "@/lib/queries/user";
import { cn, getFileUrl } from "@/lib/utils/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

type ProfilePfpProps = {
    user: User;
};

export default function ProfilePfp({ user }: ProfilePfpProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const [open, setOpen] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const { handleUpload } = useUploadFile()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);
        setOpen(true); // Open cropper dialog
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
            })

            if(error || !url) {
                throw new Error(error || "Url missing");
            }
            
            const { error: userError } = await updateUser({ 
                data: {
                    image: url
                },
                userId: user.id
            })
            
            if(userError) {
                throw new Error(userError);
            }
            
            toast.success(`Lookin good :)`);
            queryClient.invalidateQueries({ queryKey: userQueries.session._def });
            
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            setSelectedFile(null);
            
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to upload image"            
            toast.error(msg)
        } finally {
            setIsUploading(false);
        }
    };

    const handleDialogClose = () => {
        setOpen(false);
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
            fileInputRef.current?.click()
        }
    }, [isUploading])

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [previewUrl]);

    return (
        <>
            <div className={cn(
                    "relative w-full h-full group cursor-pointer",
                    "w-50 h-50",
                    isUploading && "cursor-wait"
                )}
                onClick={triggerFileInput}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                
                <Pfp 
                    image={getFileUrl(user.image)}
                    className={cn(
                        "object-cover rounded-lg border-2 border-primary/20",
                        "w-full h-full transition-opacity duration-200",
                        isUploading && "opacity-75"
                    )}
                />
                
                {isUploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
                        <div className="bg-background/90 rounded-full p-3 shadow-lg">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                        </div>
                    </div>
                )}
                
                {!isUploading && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 rounded-full p-2 shadow-lg">
                            <Camera size={18} />
                        </div>
                    </div>
                )}
            </div>

            <DialogWrapper
                trigger={null} // No trigger needed, controlled by open state
                open={open}
                setOpen={handleDialogClose}
                title="Crop Your Image"
                description="Adjust your profile picture by cropping it to the perfect size"
                className="min-w-2xl"
                handleOnly={true}
            >
                {previewUrl && (
                    <Cropper 
                        image={previewUrl}
                        onCrop={handleCroppedImage}
                        onCancel={handleDialogClose}
                        className="pt-4 md:pt-0"
                    />
                )}
            </DialogWrapper>
        </>
    );
}