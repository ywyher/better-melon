import AddToAnki from "@/components/add-to-anki"
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

  return (
    <div
      className="flex flex-col gap-2 items-center"
    >
      <div
        className="text-5xl text-center"
      >
        {literal}
      </div>
      <AddToAnki
        kanji={literal}
        definition={definition}
        sentenceKanji={sentences.kanji}
        sentenceEnglish={sentences.english}
        sentenceKana={kanaSentence ?? ''}
        disabled={isLoading}
      >
        <Badge className="cursor-pointer">
          Add to anki
        </Badge>
      </AddToAnki>
    </div>
  )
}