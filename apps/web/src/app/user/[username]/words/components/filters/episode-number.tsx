import { NumberInput } from "@/components/form/number-input"
import { parseAsInteger, useQueryState } from "nuqs"

export default function ProfileWordsEpisodeNumberFilter() {
  const [episodeNumber, setEpisodeNumber] = useQueryState('episodeNumber', parseAsInteger)

  return (
    <NumberInput
      onChange={(e) => setEpisodeNumber(e)}
      placeholder="Episode number..."
      className="w-full"
      value={episodeNumber ?? undefined}
    />
  )
}