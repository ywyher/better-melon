import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";

export default function ProfileHistorySearchBar() {
  const [query, setQuery] = useQueryState('query')
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [value, setValue] = useState(query || "")
  
  const handleSubmit = () => {
    setQuery(value ? value : null)
    setPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }
  
  return (
    <div className="flex flex-row gap-2 flex-2 items-center">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full"
        placeholder="Search history..."
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