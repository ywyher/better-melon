import type { Kanjidic2Misc } from "@/types/kanjidic2"

type Kanjidic2MiscProps ={
  misc: Kanjidic2Misc
}

export default function Kanjidic2Misc({ misc }: Kanjidic2MiscProps) {
  return (
    <div className="inline-flex flex-row flex-wrap gap-2">
      <p className="text-gray-500 font-bold text-md">
        {misc.strokeCounts} strokes,
        JLPT N{misc.jlptLevel},
        taugh in grede {misc.grade}
      </p>
    </div>
  )
}