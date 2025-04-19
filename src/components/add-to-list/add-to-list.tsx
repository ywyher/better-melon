"use client"

import AnilistListOptions from "@/components/add-to-list/anilist-list-options";
import SelectConnectionProvider from "@/components/add-to-list/select-connection-provider";
import DialogWrapper from "@/components/dialog-wrapper";
import Anilist from "@/components/svg/anilist";
import { Button } from "@/components/ui/button";
import { AnimeListProivder } from "@/types";
import { Anime } from "@/types/anime";
import { FilePenLine } from "lucide-react";
import { useState } from "react";

export default function AddToList({ animeId }: { animeId: Anime['id'] }) {
    const [open, setOpen] = useState<boolean>(false)
    const [selectedProvider, setSelectedProvider] = useState<AnimeListProivder>({
        name: "anilist",
        icon: Anilist
    })

    return (
        <DialogWrapper
            open={open}
            setOpen={setOpen}
            trigger={<Button className="w-fit"><FilePenLine /> Add to list</Button>}
            title={<SelectConnectionProvider selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} />}
        >
            {selectedProvider.name == 'anilist' && (
                <AnilistListOptions animeId={animeId} />
            )}
        </DialogWrapper>
    )
}