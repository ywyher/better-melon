import { ArrowUpDown } from "lucide-react"

export type ViewAllProps = { 
  navigateToSearch: (query: string) => void,
  query: string
}

export default function ViewAll({ navigateToSearch, query }: ViewAllProps) {
  return (
    <div className="border-t p-0 bg-background mt-auto">
      <div 
        className="flex flex-row items-center w-full justify-between cursor-pointer p-2 rounded hover:bg-accent"
        onClick={() => navigateToSearch(query)}
      >
        <div className="flex items-center gap-2 w-full">
          <span>View all</span>
        </div>
        <div className="hidden md:flex flex-row gap-2 justify-end w-full text-xs text-muted-foreground">
          <div className="flex flex-row gap-2">
            <span className="rounded border px-1"><ArrowUpDown size={16} /></span>
            <p>navigate,{" "}</p>
          </div>
          <div className="flex flex-row gap-2">
            <span className="rounded border px-1">Enter</span> 
            <p>select,{" "}</p>
          </div>
          <div className="flex flex-row gap-2">
            <span className="rounded border px-1">Esc</span>
            <p>close</p>
          </div>
        </div>
      </div>
    </div>
  )
}