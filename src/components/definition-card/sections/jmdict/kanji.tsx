import useAddToAnki from "@/lib/hooks/use-add-to-anki"
import type { JMdictGloss, JMdictKana, JMdictKanji, JMdictPos, JMdictSentence } from "@/types/jmdict"
import { jmdictTags } from "@/lib/constants/jmdict"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { subtitleQueries } from "@/lib/queries/subtitle"
import { toast } from "sonner"

type JMdictKanjiProps = {
  kanji: JMdictKanji
  kana: JMdictKana
  pos: JMdictPos[],
  definition: JMdictGloss
  sentenceKanji?: JMdictSentence
  sentenceEnglish?: JMdictSentence
}

export default function JMdictKanji({ kanji, kana, pos, definition, sentenceEnglish, sentenceKanji }: JMdictKanjiProps) {  
  const { data: kanaSentence, isLoading } = useQuery({
    ...subtitleQueries.toKana(sentenceKanji?.text || ""),
  })
  
  const { addToAnki } = useAddToAnki({
    fields: {
      kanji: kanji.text || "",
      kana: kana.text || "",
      definition: definition.text || "",
      "sentence-kanji": sentenceKanji?.text || "",
      "sentence-english": sentenceEnglish?.text || "",
      "sentence-kana": kanaSentence || "",
      "part-of-speech": pos
        ?.map(p => jmdictTags[p] || p)
        .join(', ')
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl">{kanji.text || kana.text}</p>
      <div className="flex flex-col gap-3">
        {(kanji.common || kana.common) && <Badge variant="secondary" className="min-w-[100px]">common kanji</Badge>}
        <Badge
          onClick={() => {
            if(!isLoading) {
              addToAnki()
            }else {
              toast.warning(`Still converting kanji sentence to kana please, again later`)
            }
          }}
          className="cursor-pointer min-w-[100px]"
        >
          Add to anki
        </Badge>
      </div>
    </div>
  )
}