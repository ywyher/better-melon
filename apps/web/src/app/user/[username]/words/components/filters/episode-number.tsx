import { NumberInput } from "@/components/form/number-input"
import { parseAsInteger, useQueryState } from "nuqs"
import { useEffect, useState } from "react"

export default function ProfileWordsEpisodeNumberFilter() {
  const [episodeNumber, setEpisodeNumber] = useQueryState('episodeNumber', parseAsInteger)
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    setValue(episodeNumber)
  }, [episodeNumber])

  return (
    <NumberInput
      onChange={(e) => setEpisodeNumber(e)}
      placeholder="Episode number..."
      className="w-full"
      value={value ?? undefined}
    />
  )
}