import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "use-debounce";

export default function ProfileWordsWordFilter() {
  const [word, setWord] = useQueryState('word')
  const [value, setValue] = useState<string | null>(word)
  const [debouncedValue] = useDebounce(value, 300)
  const isInitialized = useRef(false)

  // Initialize value from word on mount
  useEffect(() => {
    if (!isInitialized.current) {
      setValue(word)
      isInitialized.current = true
    }
  }, [word])

  // Update query state when debounced value changes
  useEffect(() => {
    if (isInitialized.current && debouncedValue !== word) {
      setWord(debouncedValue)
    }
  }, [debouncedValue, setWord])

  // Sync with external word changes (but not initial mount)
  useEffect(() => {
    if (isInitialized.current && word !== value) {
      setValue(word)
    }
  }, [word])

  return (
    <Input
      name="word"
      onChange={(e) => setValue(e.currentTarget.value)}
      className="w-full"
      placeholder="Search words..."
      value={value || ""}
    />
  )
}