import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchFilters } from "@/types/search";
import { Search } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";

type SearchBarProps = {
  onApply: (variables?: Partial<SearchFilters>) => void
}

export default function SearchBar({
  onApply,
}: SearchBarProps) {
  const [query, setQuery] = useQueryState('query')
  const [value, setValue] = useState(query || "")
  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  
  const handleSubmit = () => {
    setQuery(value ? value : null)
    setPage(null)
    onApply({
      query: value ? value : undefined,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }
  
  return (
    <div className="flex flex-row gap-2 items-center">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full"
        placeholder="Search anime..."
      />
      <Button
        className="w-fit"
        onClick={handleSubmit}
      >
        <Search />
        Search
      </Button>
    </div>
  )
}