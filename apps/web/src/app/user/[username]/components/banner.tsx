import Cropper from "@/components/cropper";
import DialogWrapper from "@/components/dialog-wrapper";
import { User } from "@/lib/db/schema";
import useUserFiles from "@/lib/hooks/use-user-files";
import { cn, getFileUrl } from "@/lib/utils/utils";
import { Camera } from "lucide-react";
import Image from "next/image";

export function UserBanner({ user }: { user: User }) {
  const {
    fileInputRef,
    previewUrl,
    isUploading,
    open,
    handleFileChange,
    handleCroppedImage,
    handleDialogClose,
    triggerFileInput
  } = useUserFiles({ 
    user, 
    field: 'banner',
    successMessage: 'Banner updated successfully!'
  });

  return (
    <>
      <div
        className={cn(
          "relative group cursor-pointer",
          "absolute inset-0 top-0 left-1/2 transform -translate-x-1/2 w-screen h-80",
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
        
        <Image
          src={previewUrl || getFileUrl(user.banner)}
          alt="Profile banner"
          fill
          className={cn(
            "object-cover transition-opacity duration-200",
            isUploading && "opacity-75"
          )}
        />
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="bg-background/90 rounded-full p-3 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          </div>
        )}
        
        {!isUploading && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center z-10">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 rounded-full p-3 shadow-lg">
              <Camera size={20} />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background"></div>
      </div>

      <DialogWrapper
        trigger={null}
        open={open}
        setOpen={handleDialogClose}
        title="Crop Your Banner"
        description="Adjust your banner by cropping it to the perfect size"
        className="min-w-2xl"
        handleOnly={true}
      >
        {previewUrl && (
          <Cropper 
            image={previewUrl}
            onCrop={handleCroppedImage}
            onCancel={handleDialogClose}
            className="pt-4 md:pt-0"
            cropType="banner"
          />
        )}
      </DialogWrapper>
    </>
  );
}