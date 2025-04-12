"use client"

import * as React from "react"
import { Search as SearchIcon } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { gql, useQuery } from "@apollo/client"
import { Anime } from "@/types/anime"
import SearchItem from "@/components/header/search-item"
import { useDebounce } from "use-debounce"
import { useRouter } from "next/navigation"
import { useIsSmall } from "@/hooks/useMediaQuery"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer"
import { DialogHeader } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"

const GET_ANIMES = gql`
  query GetAnimes($search: String) {
    Page(perPage: 8) {
      pageInfo {
        hasNextPage
      }
      media(
        type: ANIME,
        sort: [POPULARITY_DESC, SCORE_DESC],
        search: $search
      ) {
        id
        title {
          english
        }
        status
        coverImage {
          large
        }
        seasonYear
      }
    }
  }
`;

export default function Search() {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [debouncedValue] = useDebounce(inputValue, 500)
  const isSmall = useIsSmall()
  const router = useRouter()
  
  const { data, loading, error } = useQuery(GET_ANIMES, {
    variables: {
      search: debouncedValue
    },
    skip: !debouncedValue,
  });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const animeResults = data?.Page?.media || []
  const filteredResults = animeResults.filter((anime: Anime) => anime.title?.english)

  const navigateToInfo = (id: number) => {
    router.push(`/info/${id}`)
    setOpen(false)
  }

  const navigateToSearch = () => {
    router.push('/search')
    setOpen(false)
  }

  const viewAll = (
    <div className="border-t p-0 bg-background mt-auto">
      <div 
        className="flex items-center w-full justify-between cursor-pointer p-2 rounded hover:bg-accent"
        onClick={() => navigateToSearch()}
      >
        <div className="flex items-center gap-2">
          <span>View all</span>
        </div>
        <div className="text-xs text-muted-foreground hidden md:block">
          <span className="rounded border px-1">↑↓</span> navigate,{" "}
          <span className="rounded border px-1">Enter</span> select,{" "}
          <span className="rounded border px-1">Esc</span> close
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Button
        variant="ghost"
        className="flex flex-row gap-2 text-md"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="h-4 w-4" />
        Search
      </Button>
      {isSmall ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="
            h-screen
            flex flex-col gap-4 px-4
          ">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
                placeholder="Search anime..."
              />
            </DialogHeader>
              {loading && <div className="p-4 text-center text-sm">Loading...</div>}
              {error && <div className="p-4 text-center text-sm text-red-500">Error: {error.message}</div>}
              
              {!debouncedValue && (
                <p className="text-center">Search Anime</p>
              )}
              
              {debouncedValue && filteredResults.length === 0 && !loading && (
                <p className="text-center">No results found.</p>
              )}
          
            <div className="
              max-h-full overflow-y-scroll
              flex flex-col gap-4
            ">
              {filteredResults.length > 0 && filteredResults.map((anime: Anime) => (
                <div
                  key={anime.id}
                  className="cursor-pointer hover:bg-secondary/20 transition-all"
                  onSelect={() => navigateToInfo(parseInt(anime.id.toString()))}
                >
                  <div className="w-full">
                    <SearchItem
                      title={anime.title.english}
                      cover={anime.coverImage.large}
                      seasonYear={anime.seasonYear}
                      status={anime.status}
                    />
                  </div>
                </div>
              ))}
            </div>
            <DrawerFooter>
              {viewAll}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ): (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <div className="flex flex-col h-full max-h-[80vh]">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              placeholder="Search anime..."
            />
            
            <div className="flex-1 overflow-y-auto">
              <CommandList>
                {loading && <div className="p-4 text-center text-sm">Loading...</div>}
                {error && <div className="p-4 text-center text-sm text-red-500">Error: {error.message}</div>}
                
                {!debouncedValue && (
                  <CommandEmpty>Search Anime</CommandEmpty>
                )}
                
                {debouncedValue && filteredResults.length === 0 && !loading && (
                  <CommandEmpty>No results found.</CommandEmpty>
                )}
                
                {filteredResults.length > 0 && (
                  <CommandGroup heading="Results">
                    {filteredResults.map((anime: Anime) => (
                      <CommandItem
                        key={anime.id}
                        value={anime.title.english}
                        className="cursor-pointer"
                        onSelect={() => navigateToInfo(parseInt(anime.id.toString()))}
                      >
                        <div className="w-full">
                          <SearchItem
                            title={anime.title.english}
                            cover={anime.coverImage.large}
                            seasonYear={anime.seasonYear}
                            status={anime.status}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </div>
            {viewAll}
          </div>
        </CommandDialog>
      )}
    </>
  )
}