import useAddToAnki from "@/lib/hooks/use-add-to-anki"
import type { JMdictGloss, JMdictKana, JMdictKanji, JMdictPos, JMdictSentence } from "@/types/jmdict"
import { jmdictTags } from "@/lib/constants/jmdict"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { subtitleQueries } from "@/lib/queries/subtitle"
import { toast } from "sonner"
import AddToAnki from "@/components/add-to-anki"

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
  
  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl">{kanji.text || kana.text}</p>
      <div className="flex flex-col gap-3">
        {(kanji.common || kana.common) && <Badge variant="secondary" className="min-w-[100px]">common kanji</Badge>}
        <AddToAnki
          kanji={kanji.text || ""}
          kana={kana.text || ""}
          definition={definition.text || ""}
          sentenceKanji={sentenceKanji?.text || ""}
          sentenceEnglish={sentenceEnglish?.text || ""}
          sentenceKana={kanaSentence || ""}
          partOfSpeech={pos
            ?.map(p => jmdictTags[p] || p)
            .join(', ')}
          disabled={isLoading}
        >
          <Badge className="cursor-pointer min-w-[100px]">
            Add to anki
          </Badge>
        </AddToAnki>
      </div>
    </div>
  )
}