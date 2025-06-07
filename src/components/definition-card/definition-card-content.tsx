'use client'

import { DefinitionCardContentSkeleton } from "@/components/definition-card/defintion-card-content-skeleton"
import JMdictSection from "@/components/definition-card/sections/jmdict/section"
import JMnedictSection from "@/components/definition-card/sections/jmnedict/seciton"
import Kanjidic2Section from "@/components/definition-card/sections/kanjidic2/section"
import { Separator } from "@/components/ui/separator"
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
  isLoading: boolean
}

// Updated DefinitionCardContent with loading skeleton
export default function DefinitionCardContentWithSkeleton({
  isExpanded,
  dictionary,
  entries,
  isLoading = false
}: DefinitionCardContentProps) {
  if (isLoading) {
    return <DefinitionCardContentSkeleton isExpanded={isExpanded} />
  }

  return (
    <div className="flex flex-col gap-2">
      {isExpanded ? (
        <div className={cn(
          dictionary && dictionary?.length > 1 && "flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-4"
        )}>
          <div className="col-span-8">
            <JMdictSection entries={dictionary?.find(d => d.index == 'jmdict')?.entries as JMdictWord[]} />
          </div>
          <div className={cn(
            "col-span-4",
            "sm:border-t-2 sm:pt-5 lg:pt-0 lg:border-none"
          )}>
            <div className="flex flex-col gap-4">
              <Kanjidic2Section
                entries={dictionary?.find(d => d.index == 'kanjidic2')?.entries as Kanjidic2Character[]} 
                sentences={{
                  kanji: (dictionary?.find(d => d.index == 'jmdict')?.entries as JMdictWord[])[0].sense[0].examples?.[0]?.sentences.find(s => s.land == 'jpn')?.text || "",
                  english: (dictionary?.find(d => d.index == 'jmdict')?.entries as JMdictWord[])[0].sense[0].examples?.[0]?.sentences.find(s => s.land == 'eng')?.text || "",
                }}
              />
              {dictionary?.find(d => d.index == 'kanjidic2')?.entries && <Separator />}
              <JMnedictSection
                entries={dictionary?.find(d => d.index == 'jmnedict')?.entries as JMnedictWord[]}
              />
            </div>
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