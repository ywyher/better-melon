import type { JMdictGloss } from "@scriptin/jmdict-simplified-types"

type JMdictGlossProps = {
  gloss: JMdictGloss
  append?: React.ReactNode
}

export default function JMdictGloss({ gloss, append }: JMdictGlossProps) {
  return (
    <div className="flex flex-row gap-0">
      <p>{gloss.text}</p>
      {append}
    </div>
  )
}