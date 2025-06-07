import { Badge } from "@/components/ui/badge"
import useAddToAnki from "@/lib/hooks/use-add-to-anki"
import { subtitleQueries } from "@/lib/queries/subtitle"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

type Kanjidic2LiteralProps = {
  literal: string
  definition: string
  sentences: {
    kanji: string;
    english: string;
  }
}

export default function Kanjidic2Literal({ literal, definition, sentences }: Kanjidic2LiteralProps) {
  const { data: kanaSentence, isLoading } = useQuery({
    ...subtitleQueries.toKana(sentences.kanji || ""),
  })

  const { addToAnki } = useAddToAnki({
    fields: {
      kanji: literal,
      definition: definition,
      "sentence-kanji": sentences.kanji,
      "sentence-english": sentences.english,
      "sentence-kana": kanaSentence,
    },
  })

  return (
    <div
      className="flex flex-col gap-2 items-center"
    >
      <div
        className="text-5xl text-center"
      >
        {literal}
      </div>
      <Badge
        onClick={() => {
          if(!isLoading) {
            addToAnki()
          }else {
            toast.warning(`Still converting kanji sentence to kana please, again later`)
          }
        }}
        className="cursor-pointer"
      >
        Add to anki
      </Badge>
    </div>
  )
}