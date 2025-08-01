"use client"

import { User } from "@/lib/db/schema";
import useUploadFile from "@/lib/hooks/use-upload-file";
import { cn, getFileUrl } from "@/lib/utils/utils";
import Image from "next/image";
import { useRef } from "react";
import { toast } from "sonner";

type ProfilePfpProps = {
    user: User;
};

export default function ProfilePfp({ user }: ProfilePfpProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const {
        handleUpload,
    } = useUploadFile()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        try {
            const { error, message } = await handleUpload({
                file,
                options: {
                    acceptedTypes: ['images'],
                    maxSize: 2
                }
            })
            if(error) throw new Error(error)
            toast.success(message)
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed yo upload image"            
            toast.error(msg)
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className={cn(
                "relative w-full h-full group",
                "w-50 h-50"
            )}
            onClick={triggerFileInput}
        >
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            <Image
              src={getFileUrl(user.image)}
              alt={user.name || "Profile picture"}
              fill
              className="object-cover rounded-lg border-2 border-primary/20"
            />
        </div>
    );
}
