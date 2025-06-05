type Kanjidic2LiteralProps = {
  literal: string
}

export default function Kanjidic2Literal({ literal }: Kanjidic2LiteralProps) {
  return (
    <div
      className="
        text-5xl
        text-center
      "
    >
      {literal}
    </div>
  )
}