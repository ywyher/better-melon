import AddToAnki from "@/components/add-to-anki"
import { Badge } from "@/components/ui/badge"
import useAddToAnki from "@/lib/hooks/use-add-to-anki"
import type { JMnedictKana, JMnedictKanji, JMnedictTranslationTranslation } from "@/types/jmnedict"

type JMnedictNameProps = {
  kanji: JMnedictKanji
  kana: JMnedictKana
  translation: JMnedictTranslationTranslation
}

export default function JMnedictName({ kana, kanji, translation }: JMnedictNameProps) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-3">
      <p className="text-2xl">{kanji.text || kana.text}</p>
      <div className="flex flex-col gap-3">
        <AddToAnki
          kanji={kanji.text}
          kana={kana.text}
          definition={translation.text}
        >
          <Badge className="cursor-pointer min-w-[100px]">
            Add to anki
          </Badge>
        </AddToAnki>
      </div>
    </div>
  )
}