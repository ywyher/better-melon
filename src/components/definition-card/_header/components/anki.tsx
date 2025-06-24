import AddToAnki from "@/components/add-to-anki";
import { jmdictTags } from "@/lib/constants/jmdict";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { JMdictPos, JMdictWord } from "@/types/jmdict";
import { Plus } from "lucide-react";

export default function DefinitionCardHeaderAnki({ entries }: { entries?: JMdictWord[] | null }) {
  const sentences = useDefinitionStore((state) => state.sentences)
  const token = useDefinitionStore((state) => state.token)
  const isAddToAnki = useDefinitionStore((state) => state.isAddToAnki)
  
  return (
    <>
      {isAddToAnki && (
        <AddToAnki
          kanji={token?.original_form || ""}
          kana={entries?.[0]?.kana[0]?.text || ""}
          definition={entries?.[0]?.sense[0]?.gloss[0]?.text || ""}
          sentenceKanji={sentences.kanji || ""}
          sentenceKana={sentences.kana || ""}
          sentenceEnglish={sentences.english || ""}
          partOfSpeech={
            (entries?.[0]?.sense[0]?.partOfSpeech as JMdictPos[])
            ?.map(p => jmdictTags[p] || p) // Get tag value or fallback to original if not found
            .join(', ')
          }
        >
          <Plus />
        </AddToAnki>
      )}
    </>
  )
}