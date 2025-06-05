'use client'

import JMdictSection from "@/components/definition-card/sections/jmdict/section"
import Kanjidic2Section from "@/components/definition-card/sections/kanjidic2/section"
import { useDefinition } from "@/lib/hooks/use-definition"
import { cn } from "@/lib/utils"
import { JMdictWord, Kanjidic2Character } from "@scriptin/jmdict-simplified-types"

type DefinitionCardContentProps = {
  isExpanded: boolean
  query?: string
}

export default function DefinitionCardContent({
  isExpanded,
  query
}: DefinitionCardContentProps) {
  const { dictionary, entries, isFuzzy, isLoading, error } = useDefinition({ query, isExpanded })

  if(error) return <>{error.message || "An error occurred"}</>
  if(isLoading) return <>Loading...</>

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
        <p className="text-red-500">
          {entries?.[0].sense?.[0]?.gloss?.[0]?.text || "Nothing found"}
        </p>
      )}
      {isFuzzy && <p className="text-xs">This is fuzzy translation, might lack accuracy</p>}
    </div>
  )
}