'use client'

import JMdictSection from "@/components/definition-card/sections/jmdict/section"
import Kanjidic2Section from "@/components/definition-card/sections/kanjidic2/section"
import { cn } from "@/lib/utils"
import { Index } from "@/types/dictionary"
import { JMdictWord } from "@/types/jmdict"
import { JMnedictWord } from "@/types/jmnedict"
import { Kanjidic2Character } from "@/types/kanjidic2"

type DefinitionCardContentProps = {
  isExpanded: boolean
  dictionary: {
    index: Index;
    entries: JMdictWord[] | Kanjidic2Character[] | JMnedictWord[];
  }[] | undefined | null;
  entries?: JMdictWord[] | null
}

export default function DefinitionCardContent({
  isExpanded,
  dictionary,
  entries
}: DefinitionCardContentProps) {
  return (
    <div className="flex flex-col gap-2">
      {isExpanded ? (
        <div className={cn(
          dictionary && dictionary?.length > 1 && "grid grid-cols-12 gap-4"
        )}>
          <div className="col-span-8">
            <JMdictSection entries={dictionary?.find(d => d.index == 'jmdict')?.entries as JMdictWord[]} />
          </div>
            <div className="col-span-4">
              <Kanjidic2Section entries={dictionary?.find(d => d.index == 'kanjidic2')?.entries as Kanjidic2Character[] || []} />
            </div>
        </div>
      ): (
        <p>
          {entries?.[0].sense?.[0]?.gloss?.[0]?.text || "Nothing found"}
        </p>
      )}
    </div>
  )
}