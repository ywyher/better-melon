import type { Kanjidic2Misc } from "@/types/kanjidic2"

type Kanjidic2MiscProps ={
  misc: Kanjidic2Misc
}

export default function Kanjidic2Misc({ misc }: Kanjidic2MiscProps) {
  return (
    <div className="flex flex-row gap-2">
      <p className="text-gray-500 font-bold text-md">{misc.strokeCounts} strokes,</p>
      <p className="text-gray-500 font-bold text-md">JLPT N{misc.jlptLevel},</p>
      <p className="text-gray-500 font-bold text-md">taugh in grede {misc.grade}</p>
    </div>
  )
}