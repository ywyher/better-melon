import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 backdrop-blur-xs -m-1 flex items-center justify-center z-10 rounded-md">
      <div className="rounded-lg p-4 shadow-lg flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-2xl text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}