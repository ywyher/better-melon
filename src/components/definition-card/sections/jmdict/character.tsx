import { Badge } from "@/components/ui/badge"
import { JMdictKana, JMdictKanji } from "@scriptin/jmdict-simplified-types"

type JMdictCharacterProps = {
  character: JMdictKanji | JMdictKana
}

export default function JMdictCharacter({ character }: JMdictCharacterProps) {
  return (
    <div className="flex flex-col gap-3">
      <p>{character.text}</p>
      {character.common && <Badge variant="secondary">common word</Badge>}
    </div>
  )
}