import type { Kanjidic2Meaning } from "@scriptin/jmdict-simplified-types"

type Kanjidic2MeaningProps = {
  meaning: Kanjidic2Meaning
}

export default function Kanjidic2Menaing({ meaning }: Kanjidic2MeaningProps) {
  return (
    <div className="text-2xl">{meaning.value}</div>
  )
}