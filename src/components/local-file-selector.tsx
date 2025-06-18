'use client'

import { subtitleFormats } from "@/lib/constants/subtitle";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { cn, getExtension } from "@/lib/utils/utils";
import { Check, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface FileState {
  loading: boolean;
  fileName: string | null;
  error: string | null;
}

interface LocalFileSelectorProps {
  onSelect?: () => void
}

export default function LocalFileSelector({ onSelect }: LocalFileSelectorProps) {
  const [fileState, setFileState] = useState<FileState>({
    loading: false,
    fileName: null,
    error: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile);
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);

  useEffect(() => {
    if (activeSubtitleFile?.source === "local" && activeSubtitleFile.file) {
      setFileState(prev => ({
        ...prev,
        fileName: activeSubtitleFile.file.name,
        error: null
      }));
    }
  }, [activeSubtitleFile]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileState({ loading: true, fileName: null, error: null });
    
    try {
      const isJpn = await Promise.resolve(setTimeout(() => {
        return true;
      }, 100));
      
      if (isJpn) {
        setFileState({ loading: false, fileName: file.name, error: null });
        setActiveSubtitleFile({ source: "local", file });
        
        toast.success("File uploaded successfully!");
        if(onSelect) onSelect()
      } else {
        setFileState({ loading: false, fileName: null, error: "Subtitles must be in Japanese" });
        toast.warning("Subtitles must be in Japanese");
      }
    } catch (error) {
      setFileState({ loading: false, fileName: null, error: "Failed to process file" });
      toast.error("Failed to process file");
    }
    
    // Reset input value to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setActiveSubtitleFile]);

  const clearFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFileState({ loading: false, fileName: null, error: null });
    setActiveSubtitleFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setActiveSubtitleFile]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const { loading, fileName, error } = fileState;

  return (
    <div className="w-full max-w-lg">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={subtitleFormats.map(format => `.${format}`).join(',')}
        className="sr-only"
        aria-describedby="file-upload-description"
      />
      
      <div 
        onClick={triggerFileInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={fileName ? `Selected file: ${fileName}. Click to change file.` : "Upload subtitle file"}
        className={cn(
          "group relative flex items-start gap-3 p-4 rounded-lg border-2 border-dashed",
          "transition-all duration-200 cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          fileName && !error 
            ? "border-primary/50 bg-primary/5 hover:bg-primary/10" 
            : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/50",
          loading && "pointer-events-none opacity-75",
          error && "border-destructive/50 bg-destructive/5"
        )}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : fileName && !error ? (
            <Check className="h-5 w-5 text-primary" />
          ) : (
            <Upload className={cn(
              "h-5 w-5 transition-colors",
              error ? "text-destructive" : "text-muted-foreground group-hover:text-foreground"
            )} />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1">
            <p className={cn(
              "text-sm font-medium break-words",
              error ? "text-destructive" : fileName ? "text-foreground" : "text-muted-foreground"
            )}>
              {fileName || `Upload subtitle file (${subtitleFormats.join(', ')})`}
            </p>
            
            {fileName && !error && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {getExtension(fileName)}
                </span>
              </div>
            )}
            
            {error && (
              <p className="text-xs text-destructive mt-1">
                {error}
              </p>
            )}
          </div>
        </div>
        
        {/* Clear button */}
        {fileName && !loading && (
          <button
            onClick={clearFile}
            className="cursor-pointer flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Remove file"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}