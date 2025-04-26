"use client"

import { User } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type ProfilePfpProps = {
    user: User;
    isEditing: boolean;
};

export default function ProfilePfp({ isEditing }: ProfilePfpProps) {
    const [,setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        if (!file.type.startsWith('image/')) {
          toast.error('Please select an image file');
          return;
        }
    
        if (file.size > 4 * 1024 * 1024) {
          toast.error('Image size should be less than 4MB');
          return;
        }
    
        setSelectedFile(file);
    };

    const triggerFileInput = () => {
        if(!isEditing) return;
        fileInputRef.current?.click()
    }

    return (
        <div className={cn(
                "relative w-full h-full group",
                isEditing && "cursor-pointer",
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
            {isEditing && (
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-[#00000066] opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-200",
                        "flex justify-center items-center"
                    )}
                >
                    <Camera />
                </div>
            )}
        </div>
    );
}
