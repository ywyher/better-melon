import { Badge } from "@/components/ui/badge"
import useAddToAnki from "@/lib/hooks/use-add-to-anki"
import { JMdictGloss, JMdictKana, JMdictKanji, JMdictSentence } from "@/types/jmdict"

type JMdictWordProps = {
  word: JMdictKanji | JMdictKana
  meaning: JMdictGloss
  sentence?: JMdictSentence
}

export default function JMdictWord({ word, meaning, sentence }: JMdictWordProps) {

  const { addToAnki } = useAddToAnki({
    word: word.text,
    sentence: sentence?.text,
    definition: meaning.text
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl">{word.text}</p>
      <div className="flex flex-col gap-3">
        {word.common && <Badge variant="secondary" className="min-w-[100px]">common word</Badge>}
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