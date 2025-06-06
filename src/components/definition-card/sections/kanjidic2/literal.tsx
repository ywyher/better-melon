import { Badge } from "@/components/ui/badge"
import useAddToAnki from "@/lib/hooks/use-add-to-anki"
import { toKana } from "wanakana"

type Kanjidic2LiteralProps = {
  literal: string
  definition: string
  sentances: {
    kanji: string;
    english: string;
  }
}

export default function Kanjidic2Literal({ literal, definition, sentances }: Kanjidic2LiteralProps) {
  const { addToAnki } = useAddToAnki({
    fields: {
      kanji: literal,
      definition: definition,
      "sentence-kanji": sentances.kanji,
      "sentence-english": sentances.english,
      "sentence-kana": toKana(sentances.kanji),
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
        onClick={() => addToAnki()}
        className="cursor-pointer"
      >
        Add to anki
      </Badge>
    </div>
  )
}