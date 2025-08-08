import Pfp from "@/components/pfp";
import Cropper from "@/components/cropper";
import DialogWrapper from "@/components/dialog-wrapper";
import { User } from "@/lib/db/schema";
import { Camera } from "lucide-react";
import { cn, getFileUrl } from "@/lib/utils/utils";
import useUserFiles from "@/lib/hooks/use-user-files";

type ProfilePfpProps = {
  user: User;
};

export function UserPfp({ user }: ProfilePfpProps) {
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
    field: 'image',
    successMessage: 'Lookin good :)'
  });

  return (
    <>
      <div 
        className={cn(
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
        trigger={null}
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