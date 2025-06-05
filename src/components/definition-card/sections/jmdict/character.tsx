import { Badge } from "@/components/ui/badge"
import type { JMdictKana, JMdictKanji } from "@scriptin/jmdict-simplified-types"

type JMdictWordProps = {
  word: JMdictKanji | JMdictKana
}

export default function JMdictWord({ word }: JMdictWordProps) {
  return (
    <div className="flex flex-col gap-3">
      <p>{word.text}</p>
      {word.common && <Badge variant="secondary">common word</Badge>}
    </div>
  )
}