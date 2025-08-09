import Pfp from "@/components/pfp";
import Cropper from "@/components/cropper";
import useUserFiles from "@/lib/hooks/use-user-files";
import UploadLoader from "@/app/user/[username]/components/upload-loader";
import DialogWrapper from "@/components/dialog-wrapper";
import { User } from "@/lib/db/schema";
import { cn, getFileUrl } from "@/lib/utils/utils";

type UserPfpProps = {
  userId: User['id']
  image: User['image']
}

export function UserPfp({ userId, image }: UserPfpProps) {
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
          "relative w-full h-full group cursor-pointer",
          "w-50 h-50 z-20",
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
          image={getFileUrl(image)}
          className={cn(
            "object-cover rounded-sm border-2 border-primary/20",
            "w-full h-full transition-opacity duration-200",
            isUploading && "opacity-75"
          )}
        />
        
        <UploadLoader isUploading={isUploading} />
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