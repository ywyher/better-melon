"use client"

import AnilistListOptions from "@/components/add-to-list/add-to-anilist";
import SelectConnectionProvider from "@/components/add-to-list/select-connection-provider";
import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { animeListProviders } from "@/lib/constants/anime-list";
import { userQueries } from "@/lib/queries/user";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Anime } from "@/types/anime";
import { AnimeListProivder } from "@/types/anime-list";
import { useQuery } from "@tanstack/react-query";
import { FilePenLine } from "lucide-react";
import { useEffect, useState } from "react";

type AddToListProps = { 
  animeId: Anime['id']
  isAddToList: boolean
}

export default function AddToList({ 
  animeId,
  isAddToList
}: AddToListProps ) {
  const [open, setOpen] = useState<boolean>(isAddToList || false)
  const [selectedProvider, setSelectedProvider] = useState<AnimeListProivder>(animeListProviders[0])
  const setIsAuthDialogOpen = useAuthStore((state) => state.setIsAuthDialogOpen)

  const { data: user, isLoading: isUserLoading } = useQuery({ ...userQueries.session() })
  const { data: accounts, isLoading: isAccountsLoading } = useQuery({ 
    ...userQueries.listAccounts(),
    enabled: !!user
  })

  useEffect(() => {
    console.log(accounts?.find(a => a.provider == selectedProvider.name))
  }, [accounts])

  if(isUserLoading || isAccountsLoading) return <>Loading...</>

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      trigger={<Button variant='outline' className="w-fit"><FilePenLine /> Add to list</Button>}
      title={<SelectConnectionProvider selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} />}
      className="min-w-[50%]"
      breakpoint="medium"
    >
      {!user ? (
        <div className="flex justify-center items-center">
          <Button 
            variant='outline'
            onClick={() => {
              setIsAuthDialogOpen(true)
              setOpen(false)
            }}
          >
            Authenticate
          </Button>
        </div>
      ): (
        <>
          {selectedProvider.name == 'anilist' && (
            <AnilistListOptions 
              animeId={animeId}
              provider={selectedProvider}
              accountId={accounts?.find(a => a.provider == selectedProvider.name)?.accountId}
            />
          )}
        </>
      )}
    </DialogWrapper>
  )
}