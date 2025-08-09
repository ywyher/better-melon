"use client"

import AddToAnilist from "@/components/add-to-list/lists/anilist/add-to-anilist";
import { AddToAnilistSkeleton } from "@/components/add-to-list/lists/anilist/add-to-anilist-skeleton";
import SelectListProvider from "@/components/add-to-list/select-list-provider";
import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { animeListProviders } from "@/lib/constants/anime-list";
import { userQueries } from "@/lib/queries/user";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils/utils";
import { Anime } from "@/types/anime";
import { AnimeListProivder } from "@/types/anime-list";
import { useQuery } from "@tanstack/react-query";
import { FilePenLine } from "lucide-react";
import { useState } from "react";

type AddToListProps = { 
  animeId: Anime['id']
  isAddToList?: boolean
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

export default function AddToList({ 
  animeId,
  isAddToList = false,
  variant,
  className = ""
}: AddToListProps ) {
  const [open, setOpen] = useState<boolean>(isAddToList || false)
  const [selectedProvider, setSelectedProvider] = useState<AnimeListProivder>(animeListProviders[0])
  const setIsAuthDialogOpen = useAuthStore((state) => state.setIsAuthDialogOpen)

  const { 
    data: { userId, info } = { userId: null, info: null },
    isLoading
  } = useQuery({
    ...userQueries.accountInfo({ provider: 'anilist' })
  });

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      trigger={
        <Button 
          variant={variant} 
          className={cn('w-fit', className)}
        >
          <FilePenLine /> Add to list
        </Button>
      }
      title={<SelectListProvider selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} />}
      className="min-w-[50%]"
      breakpoint="medium"
      headerClassName="p-0"
    >
      {isLoading ? (
        <AddToAnilistSkeleton />
      ): (
        <>
          {!userId || !info || !info.accessToken || !info.accountId ? (
            <Button 
              className="w-full"
              variant='outline'
              onClick={() => {
                setIsAuthDialogOpen(true)
                setOpen(false)
              }}
            >
              Authenticate
            </Button>
          ): (
            <>
              {selectedProvider.name == 'anilist' && (
                <AddToAnilist 
                  animeId={animeId}
                  provider={selectedProvider}
                  setOpen={setOpen}
                  accessToken={info.accessToken}
                  accountId={info.accountId}
                />
              )}
            </>
          )}
        </>
      )}
    </DialogWrapper>
  )
}