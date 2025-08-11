import Cropper from "@/components/cropper";
import useUserFiles from "@/lib/hooks/use-user-files";
import DialogWrapper from "@/components/dialog-wrapper";
import { cn } from "@/lib/utils/utils";
import { User } from "@/lib/db/schema";
import UploadOverlay from "@/app/user/[username]/components/profile/upload-overlay";

type UserBannerProps = {
  userId: User['id']
  banner: User['banner']
  editable?: boolean
}

export default function ProfileBanner({ userId, banner, editable = false }: UserBannerProps) {
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
    field: 'banner',
    successMessage: 'Banner updated successfully!'
  })

  return (
    <>
      <div
        className={cn(
          "group z-10 absolute top-0 left-0",
          "w-screen h-[var(--banner-height-small)] md:h-[var(--banner-height)]",
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
        
        <div
          style={{
            backgroundImage: `url("${banner}")`,
            backgroundPosition: "50% 35%",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: '#242538'
          }}
        />

        <UploadOverlay isUploading={isUploading} editable={editable} />
        <div
          className="
            absolute inset-0 
            bg-gradient-to-b 
            from-background/20 
            via-background/40 
            to-background
          "
        />
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