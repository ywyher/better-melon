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
import { useQuery } from "@apollo/client"
import { Anime } from "@/types/anime"
import SearchItem from "@/components/quick-search/search-item"
import SearchItemSkeleton from "@/components/quick-search/search-item-skeleton" // Import the skeleton component
import { useDebounce } from "use-debounce"
import { useRouter } from "next/navigation"
import { useIsSmall } from "@/lib/hooks/use-media-query"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/utils"
import { GET_ANIME_LIST } from "@/lib/graphql/queries"
import ViewAll from "@/components/quick-search/view-all"
import { queryVariables } from "@/lib/constants/anime"

export default function QuickSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [debouncedValue] = useDebounce(inputValue, 500)
  const isSmall = useIsSmall()
  const router = useRouter()
  
  const { data, loading, error } = useQuery(GET_ANIME_LIST, {
    variables: queryVariables.list.quickSearch({ query: debouncedValue }),
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

  React.useEffect(() => {
    if (inputValue !== debouncedValue) return
    setIsTyping(false)
  }, [debouncedValue, inputValue])

  const animeResults = data?.Page?.media || []
  const filteredResults = !isTyping && animeResults.filter((anime: Anime) => anime.title?.english)

  const navigateToInfo = (id: number) => {
    router.push(`/info/${id}`)
    setOpen(false)
  }

  const navigateToSearch = (query: string) => {
    router.push(`/search?query=${query}`)
    setOpen(false)
  }
  
  const skeletonItems = Array(5).fill(null)

  return (
    <>
      {isSmall ? (
        <>
          <div
            onClick={() => setOpen(true)}
            className={cn(
              className
            )}
          >
            <SearchIcon size={23} />
            <p>Search</p>
          </div>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent className="
              h-screen
              flex flex-col gap-4 px-4
            ">
              <DrawerHeader>
                <DrawerTitle></DrawerTitle>
                <Input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.currentTarget.value)
                    setIsTyping(true)
                  }}
                  placeholder="Search anime..."
                />
              </DrawerHeader>
                {(loading || isTyping) && (
                  <div className="flex flex-col gap-2 p-4">
                    <p className="text-gray-200 text-xs">Loading Results</p>
                    <div className="flex flex-col gap-3">
                      {skeletonItems.map((_, index) => (
                        <div key={index} >
                          <SearchItemSkeleton />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {error && <div className="p-4 text-center text-sm text-red-500">Error: {error.message}</div>}
                
                {!debouncedValue && (
                  <p className="text-center">Search Anime</p>
                )}
                
                {debouncedValue && filteredResults.length === 0 && !loading && (
                  <p className="text-center">No results found.</p>
                )}
            
              <div className="
                max-h-full overflow-y-scroll
                flex flex-col gap-4 px-4
              ">
                {filteredResults.length > 0 && filteredResults.map((anime: Anime) => (
                  <div
                    key={anime.id}
                    className="cursor-pointer rounded-lg hover:bg-secondary/20 transition-all"
                    onClick={() => navigateToInfo(parseInt(anime.id.toString()))}
                  >
                    <div className="w-full">
                      <SearchItem
                        title={anime.title.english}
                        cover={anime.coverImage.large}
                        status={anime.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {debouncedValue && (
                <DrawerFooter>
                  <ViewAll navigateToSearch={navigateToSearch} query={debouncedValue} />
                </DrawerFooter>
              )}
            </DrawerContent>
          </Drawer>
        </>
      ): (
        <>
          <Button
            variant="ghost"
            className={cn(
              "flex flex-row gap-2 text-md",
              className
            )}
            onClick={() => setOpen(true)}
          >
            <SearchIcon className="h-4 w-4" />
            Search
          </Button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="flex flex-col h-full max-h-[80vh]">
              <CommandInput
                value={inputValue}
                onValueChange={(e) => {
                  setInputValue(e)
                  setIsTyping(true)
                }}
                placeholder="Search anime..."
              />
              
              <div className="flex-1 overflow-y-auto">
                <CommandList>
                  {(loading || isTyping) && (
                    <div className="flex flex-col gap-2 p-4">
                      <p className="text-gray-200 text-xs">Loading Results</p>
                      <div className="flex flex-col gap-3">
                        {skeletonItems.map((_, index) => (
                          <div key={index} >
                            <SearchItemSkeleton />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {error && <div className="p-4 text-center text-sm text-red-500">Error: {error.message}</div>}
                  
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
                              status={anime.status}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </div>
              {debouncedValue && (
                <ViewAll navigateToSearch={navigateToSearch} query={debouncedValue} />
              )}
            </div>
          </CommandDialog>
        </>
      )}
    </>
  )
}