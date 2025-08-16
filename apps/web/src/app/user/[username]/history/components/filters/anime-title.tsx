import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "use-debounce";

export default function ProfileHistoryAnimeTitleFilter() {
  const [animeTitle, setAnimeTitle] = useQueryState('animeTitle')
  const [value, setValue] = useState<string | null>(animeTitle)
  const [debouncedValue] = useDebounce(value, 500)
  const isInitialized = useRef(false)

  // Initialize value from animeTitle on mount
  useEffect(() => {
    if (!isInitialized.current) {
      setValue(animeTitle)
      isInitialized.current = true
    }
  }, [animeTitle])

  // Update query state when debounced value changes
  useEffect(() => {
    if (isInitialized.current && debouncedValue !== animeTitle) {
      setAnimeTitle(debouncedValue)
    }
  }, [debouncedValue, setAnimeTitle])

  // Sync with external animeTitle changes (but not initial mount)
  useEffect(() => {
    if (isInitialized.current && animeTitle !== value) {
      setValue(animeTitle)
    }
  }, [animeTitle])

  return (
    <Input
      name="anime-title"
      onChange={(e) => setValue(e.currentTarget.value)}
      className="w-full"
      placeholder="Search anime..."
      value={value || ""}
    />
  )
}