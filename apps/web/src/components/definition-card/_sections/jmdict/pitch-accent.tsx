'use client'

import { Skeleton } from "@/components/ui/skeleton";
import { usePitchAccent } from "@/lib/hooks/use-pitch-accent";
import { generatePitchAccentHTML } from "@/lib/utils/pitch";
import { JMdictKana, JMdictKanji } from "@/types/jmdict";
import { PitchAccents } from "@/types/pitch";
import { useEffect } from "react";

type JMdictPitchAccentProps = {
  kanji: JMdictKanji[]
  kana: JMdictKana[]
}

export default function JMdictPitchAccent({ kanji, kana }: JMdictPitchAccentProps) {
  const { accent, isLoading } = usePitchAccent(kanji?.[0].text);

  if (isLoading) return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 font-medium">Pitch Accent</p>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-5 w-20" /> {/* Text skeleton */}
      </div>
    </div>
  )

  if(!accent && !isLoading) return;

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 font-medium">Pitch Accent</p>
      <div className="flex flex-wrap items-center gap-2">
        <div 
          dangerouslySetInnerHTML={{ __html: generatePitchAccentHTML({ kana: kana[0].text, accent: accent as PitchAccents }) }}
        />  
      </div>
    </div>
  )
}