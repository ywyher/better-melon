type SearchHeaderProps = {
  animesLength: number;
  query: string
}

export default function SearchHeader({ animesLength, query }: SearchHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-3">
      <div className="text-xl">
        Search Results{query ? `: ${query}` : ""}
      </div>
      <div className="text-muted-foreground text-mono text-md">
        Found {animesLength} animes
      </div>
    </div>
  )
}