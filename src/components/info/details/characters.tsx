import Character from "@/components/anime/character/character"
import { Anime } from "@/types/anime"

type DetailsCharactersProps = {
  anime: Anime
}

export default function DetailsCharacters({ anime }: DetailsCharactersProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3">
      {anime.characters.edges.map((e, idx) => (
        <Character 
          key={idx}
          character={e}
          className="col-span-3"
        />
      ))}
    </div>
  )
}