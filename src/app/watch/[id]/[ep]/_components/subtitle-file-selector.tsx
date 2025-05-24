"use client"

import { Button } from "@/components/ui/button";
import {
    DialogClose
} from "@/components/ui/dialog"
import { useState, useRef, useEffect } from "react";
import { Check, FileText, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import DialogWrapper from "@/components/dialog-wrapper";
import { usePlayerStore } from "@/lib/stores/player-store";
import { SubtitleFile } from "@/types/subtitle";
import { isFileJpn } from "@/lib/subtitle/utils";
import { subtitleFormats } from "@/lib/constants/subtitle";

export default function SubtitleFileSelector({ subtitleFiles }: { 
    subtitleFiles: SubtitleFile[];
}) {
    const [loading, setLoading] = useState<string | null>(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [localFileName, setLocalFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile)
    const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile)

    useEffect(() => {
        if (activeSubtitleFile?.source === "local" && activeSubtitleFile.file) {
            setLocalFileName(activeSubtitleFile.file.name);
        }
    }, [activeSubtitleFile]);

    const handleSelectFile = (file: SubtitleFile) => {
        if (file.name === activeSubtitleFile?.file.name) return;
        
        setLoading(file.name);
        setActiveSubtitleFile({ source: "remote", file: file });
        setLocalFileName(null)
        
        setTimeout(() => {
            setOpen(false);
            toast.message("File updated!")
            setTimeout(() => setLoading(null), 300);
        }, 500);
    };
    
    const handleLocalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        
        setLocalLoading(true);
        const file = e.target.files[0];
        
        const isJpn = await isFileJpn(file)
        
        if(isJpn) {
            setLocalFileName(file.name);
            setActiveSubtitleFile({ source: "local", file: file });
            setTimeout(() => {
                setOpen(false);
                toast.message("File updated!")
                setTimeout(() => setLocalLoading(false), 300);
            }, 500);
        }else {
            toast.warning("Subtitles must be in japanese")
            setLocalLoading(false);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const trigger = (
        <Button variant="outline" size="sm" className="flex items-center gap-2">
            <span>Change Subtitle</span>
        </Button>
    )

    return (
        <>
            <DialogWrapper
                open={open}
                setOpen={setOpen}
                title="Select a subtitle"
                trigger={trigger}
            >
                <ScrollArea className="mt-2 max-h-72 space-y-2 pr-1">
                    <div>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleLocalFileChange}
                            accept=".srt,.vtt"
                            className="hidden"
                        />
                        
                        {/* Styled file input button */}
                        <div 
                            onClick={triggerFileInput}
                            className={cn(
                                "flex items-start p-3 rounded cursor-pointer transition-colors mb-4",
                                "hover:bg-muted border border-dashed",
                                localFileName ? "border-primary bg-primary/10" : "border-muted-foreground/50",
                                localLoading ? "opacity-80" : ""
                            )}
                        >
                            <div className="flex-shrink-0 mr-2 mt-1">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <div className="font-medium text-sm break-all pr-8">
                                    {localFileName || "Upload a local subtitle file (.srt or .vtt)"}
                                </div>
                                {localFileName && (
                                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs bg-muted">
                                        {localFileName.split('.').pop()?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="ml-2 flex-shrink-0">
                                {localLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {localFileName && !localLoading && <Check className="h-5 w-5 text-primary" />}
                            </div>
                        </div>
                    </div>
                    
                    {subtitleFiles.length > 0 && (
                        <div className="text-sm font-medium mb-2 text-muted-foreground">
                            Available subtitles
                        </div>
                    )}
                        
                    {subtitleFiles.filter(f => subtitleFormats.includes(f.name.split('.').pop() || "")).map((file) => {
                        const isSelected = file.name === activeSubtitleFile?.file.name;
                        const isLoading = loading === file.name;
                        
                        const fileExt = file.name.split('.').pop();
                        
                        return (
                            <div 
                                key={file.name}
                                onClick={() => handleSelectFile(file)}
                                className={cn(
                                    "flex items-start p-3 rounded cursor-pointer transition-colors",
                                    isSelected 
                                        ? "bg-primary/10 border border-primary" 
                                        : "hover:bg-muted border border-transparent",
                                    isLoading ? "opacity-80" : ""
                                )}
                            >
                                <div className="flex-shrink-0 mr-2 mt-1">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <div className="font-medium text-sm break-all pr-8">
                                        {file.name}
                                    </div>
                                    {fileExt && (
                                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs bg-muted">
                                            {fileExt.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="ml-2 flex-shrink-0">
                                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                                    {isSelected && !isLoading && <Check className="h-5 w-5 text-primary" />}
                                </div>
                            </div>
                        );
                    })}

                    {subtitleFiles.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">
                            No subtitle files available
                        </div>
                    )}
                </ScrollArea>
                <div className="flex justify-end mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full">Cancel</Button>
                    </DialogClose>
                </div>
            </DialogWrapper>
        </>
    );
}