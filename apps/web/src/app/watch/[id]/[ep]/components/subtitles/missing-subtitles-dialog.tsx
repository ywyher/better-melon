'use client'

import LocalFileSelector from "@/components/local-file-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Anime } from "@/types/anime";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

type MissingSubtitlesDialogPorps = {
  animeTitle: Anime['title']
  episodeNumber: number
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  errorMessage: string;
  onSelect: () => void;
}

export default function MissingSubtitlesDialog({
  animeTitle,
  episodeNumber,
  open,
  setOpen,
  errorMessage,
  onSelect
}: MissingSubtitlesDialogPorps) {
  const router = useRouter()

  return (
   <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subtitles doesn&apos;t exist yet for {animeTitle.english} episode {episodeNumber}</DialogTitle>
          <DialogDescription>{errorMessage}</DialogDescription>
        </DialogHeader>
          <div className="flex flex-col gap-5">
            <LocalFileSelector
              onSelect={onSelect}
            />
            <Button
              className="w-full"
              variant='secondary'
              onClick={() => router.push('/')}
            >
              Go back
            </Button>
          </div>
      </DialogContent>
    </Dialog> 
  )
}