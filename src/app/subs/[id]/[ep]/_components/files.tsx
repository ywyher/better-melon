import { File } from "@/app/subs/[id]/[ep]/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Dispatch, SetStateAction, useState } from "react";
import { Check, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function Files({ files, setSelectedFile, selectedFile }: { 
    files: File[];
    setSelectedFile: Dispatch<SetStateAction<File | null>>
    selectedFile: File | null;
}) {
    const [loading, setLoading] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const handleSelectFile = (file: File) => {
        if (file.name === selectedFile?.name) return;
        
        setLoading(file.name);
        setSelectedFile(file);
        
        // Close dialog after selection
        setTimeout(() => {
            setOpen(false);
            toast.message("File updated!")
            // Reset loading state after dialog closes
            setTimeout(() => setLoading(null), 300);
        }, 500);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <span>Change File</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold mb-2">Select a subtitle file</DialogTitle>
                    <DialogDescription>
                        Choose from available subtitle files for this episode
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="mt-2 max-h-72 space-y-2 pr-1">
                    {files.map((file) => {
                        const isSelected = file.name === selectedFile?.name;
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

                    {files.length === 0 && (
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
            </DialogContent>
        </Dialog>
    );
}