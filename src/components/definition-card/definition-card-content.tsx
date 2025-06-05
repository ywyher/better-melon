'use client'

import JMdictSection from "@/components/definition-card/sections/jmdict/section"
import { useDefinition } from "@/lib/hooks/use-definition"
import { JMdictWord } from "@scriptin/jmdict-simplified-types"

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
        <div>
          <JMdictSection entries={dictionary?.find(d => d.index == 'jmdict')?.entries as JMdictWord[]} />
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