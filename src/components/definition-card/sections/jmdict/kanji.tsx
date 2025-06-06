import { Badge } from "@/components/ui/badge"
import useAddToAnki from "@/lib/hooks/use-add-to-anki"
import { toKana } from 'wanakana'
import type { JMdictGloss, JMdictKana, JMdictKanji, JMdictPos, JMdictSentence } from "@/types/jmdict"
import { jmdictTags } from "@/lib/constants/jmdict"

type JMdictKanjiProps = {
  kanji: JMdictKanji
  kana: JMdictKana
  pos: JMdictPos[],
  definition: JMdictGloss
  sentenceKanji?: JMdictSentence
  sentenceEnglish?: JMdictSentence
}

export default function JMdictKanji({ kanji, kana, pos, definition, sentenceEnglish, sentenceKanji }: JMdictKanjiProps) {
  const { addToAnki } = useAddToAnki({
    fields: {
      kanji: kanji.text,
      kana: kana.text,
      definition: definition.text,
      "sentence-kanji": sentenceKanji?.text,
      "sentence-english": sentenceEnglish?.text,
      "sentence-kana": toKana(sentenceKanji?.text),
      "part-of-speech": pos
        ?.map(p => jmdictTags[p] || p) // Get tag value or fallback to original if not found
        .join(', ')
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl">{kanji.text || kana.text}</p>
      <div className="flex flex-col gap-3">
        {(kanji.common || kana.common) && <Badge variant="secondary" className="min-w-[100px]">common kanji</Badge>}
        <Badge 
          onClick={() => addToAnki()}
          className="cursor-pointer min-w-[100px]"
        >
          Add to anki
        </Badge>
      </div>
    </div>
  )
}