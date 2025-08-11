import Pfp from "@/components/pfp";
import Cropper from "@/components/cropper";
import useUserFiles from "@/lib/hooks/use-user-files";
import DialogWrapper from "@/components/dialog-wrapper";
import { User } from "@/lib/db/schema";
import { cn, getFileUrl } from "@/lib/utils/utils";
import UploadOverlay from "@/app/user/[username]/components/profile/upload-overlay";

type UserPfpProps = {
  userId: User['id']
  image: User['image']
  editable?: boolean
}

export default function ProfilePfp({ userId, image, editable = false }: UserPfpProps) {
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
    userId,
    field: 'image',
    successMessage: 'Lookin good :)'
  });

  return (
    <>
      <div 
        className={cn(
          "relative w-full h-full group",
          "w-50 h-50 z-20",
          editable && "cursor-pointer",
          isUploading && "cursor-wait"
        )}
        onClick={editable ? triggerFileInput : undefined}
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
          image={getFileUrl(image)}
          className={cn(
            "object-cover rounded-sm border-2 border-primary/20",
            "w-full h-full transition-opacity duration-200",
            isUploading && "opacity-75"
          )}
        />
        
        <UploadOverlay isUploading={isUploading} editable={editable} />
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