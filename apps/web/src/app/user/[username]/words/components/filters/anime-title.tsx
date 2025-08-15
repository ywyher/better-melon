import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";

export default function ProfileWordsAnimeTitleFilter() {
  const [animeTitle, setAnimeTitle] = useQueryState('animeTitle')

  return (
    <Input
      name="anime-title"
      onChange={(e) => setAnimeTitle(e.currentTarget.value)}
      className="w-full"
      placeholder="Search anime..."
      defaultValue={animeTitle || ""}
    />
  )
}