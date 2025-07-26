import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";

type SearchBarProps = {
  onApply: (variables?: any) => void
}

export default function SearchBar({
  onApply,
}: SearchBarProps) {
  const [query, setQuery] = useQueryState('query')
  const [value, setValue] = useState(query || "")
  
  const handleSubmit = () => {
    setQuery(value ? value : null)
    onApply({
      search: value ? value : undefined
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