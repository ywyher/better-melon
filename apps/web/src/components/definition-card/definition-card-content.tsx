'use client'

import { DefinitionCardContentSkeleton } from "@/components/definition-card/defintion-card-content-skeleton"
import JMdictSection from "@/components/definition-card/_sections/jmdict/section"
import JMnedictSection from "@/components/definition-card/_sections/jmnedict/seciton"
import Kanjidic2Section from "@/components/definition-card/_sections/kanjidic2/section"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils/utils"
import { Dictionary } from "@/types/dictionary"
import { JMnedictWord } from "@/types/jmnedict"
import { useMemo } from "react"

type DefinitionCardContentProps = {
  isExpanded: boolean
  dictionary?: Dictionary
  isLoading: boolean
}

export default function DefinitionCardContent({
  isExpanded,
  dictionary,
  isLoading = false
}: DefinitionCardContentProps) {
  if (isLoading) {
    return <DefinitionCardContentSkeleton isExpanded={isExpanded} />
  }
  
  if (!dictionary?.length) {
    return null
  }

  const dictionarySections = useMemo(() => {
    const jmdict = dictionary.find((d) => d.index === 'jmdict')
    const jmnedict = dictionary.find((d) => d.index === 'jmnedict')
    const kanjidic2 = dictionary.find((d) => d.index === 'kanjidic2')
    
    return { jmdict, jmnedict, kanjidic2 }
  }, [dictionary])

  const { jmdict, jmnedict, kanjidic2 } = dictionarySections

  const sentenceData = useMemo(() => {
    if (!jmdict?.entries?.[0]?.sense?.[0]?.examples?.[0]?.sentences) {
      return { kanji: "", english: "" }
    }
    
    const sentences = jmdict.entries[0].sense[0].examples[0].sentences
    return {
      kanji: sentences.find(s => s.land === 'jpn')?.text || "",
      english: sentences.find(s => s.land === 'eng')?.text || "",
    }
  }, [jmdict])

  if (!isExpanded) {
    return (
      <div>
        {jmdict?.entries?.[0]?.sense?.[0]?.gloss?.[0]?.text || (
          <span className="text-red-500">Nothing found</span>
        )}
      </div>
    )
  }

  const hasMultipleSections = dictionary.length > 1

  return (
    <div className="flex flex-col gap-2">
      <div className={cn(
        hasMultipleSections && "flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-4"
      )}>
        {/* Main content column */}
        <div className="col-span-8">
          {jmdict && (
            <JMdictSection entries={jmdict.entries} />
          )}
        </div>

        {/* Sidebar column */}
        <div className={cn(
          "col-span-4",
          "sm:border-t-2 sm:pt-5 lg:pt-0 lg:border-none"
        )}>
          <div className="flex flex-col gap-4">
            {/* Kanji section */}
            {jmdict && kanjidic2 && (
              <Kanjidic2Section
                entries={kanjidic2.entries}
                sentences={sentenceData}
              />
            )}

            {/* Separator between sections */}
            {kanjidic2 && jmnedict && <Separator />}

            {/* Names section */}
            {jmnedict && (
              <JMnedictSection
                entries={jmnedict.entries as JMnedictWord[]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}