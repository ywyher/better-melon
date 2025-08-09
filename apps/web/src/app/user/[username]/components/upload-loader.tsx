import { Camera } from "lucide-react";

export default function UploadLoader({ isUploading }: { isUploading: boolean }) {
  return (
    <>
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
    </>
  )
}