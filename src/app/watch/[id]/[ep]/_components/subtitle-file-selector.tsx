import { Button } from "@/components/ui/button";
import {
    DialogClose
} from "@/components/ui/dialog"
import { useState } from "react";
import { Check, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import DialogWrapper from "@/components/dialog-wrapper";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { SubtitleFile } from "@/types/subtitle";

export default function SubtitleFileSelector({ subtitleFiles }: { 
    subtitleFiles: SubtitleFile[];
}) {
    const [loading, setLoading] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile)
    const setActiveSubtitleFile = useWatchStore((state) => state.setActiveSubtitleFile)

    const handleSelectFile = (file: SubtitleFile) => {
        if (file.name === activeSubtitleFile?.name) return;
        
        setLoading(file.name);
        setActiveSubtitleFile(file);
        setActiveSubtitleFile(file)
        
        // Close dialog after selection
        setTimeout(() => {
            setOpen(false);
            toast.message("File updated!")
            // Reset loading state after dialog closes
            setTimeout(() => setLoading(null), 300);
        }, 500);
    };

    const trigger = (
        <Button variant="outline" size="sm" className="flex items-center gap-2">
            <span>Change File</span>
        </Button>
    )

    return (
        <>
            <DialogWrapper
                open={open}
                onOpenChange={setOpen}
                title="Select a sbutitle"
                trigger={trigger}
            >
                <ScrollArea className="mt-2 max-h-72 space-y-2 pr-1">
                        {subtitleFiles.map((file) => {
                            const isSelected = file.name === activeSubtitleFile?.name;
                            const isLoading = loading === file.name;
                            
                            // Extract file extension
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