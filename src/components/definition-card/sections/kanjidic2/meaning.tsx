import { Kanjidic2Meaning } from "@/types/kanjidic2"

type Kanjidic2MeaningProps = {
  meaning: Kanjidic2Meaning
}

export default function Kanjidic2Menaing({ meaning }: Kanjidic2MeaningProps) {
  return (
    <div className="text-xl">{meaning.value}</div>
  )
}