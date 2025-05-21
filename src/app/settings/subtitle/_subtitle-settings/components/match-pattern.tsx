'use client'

import LoadingButton from "@/components/loading-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SubtitleSettings } from "@/lib/db/schema"
import { useSubtitleSettings } from "@/lib/hooks/use-subtitle-settings"
import { X } from "lucide-react"
  
export default function MatchPattern({ value }: { 
    value: SubtitleSettings['matchPattern']
}) {
    const { displayValue, isLoading, onSubmit, onChange } = useSubtitleSettings({
        field: 'matchPattern',
        initialValue: value,
    })

    return (
        <div className="flex flex-col gap-3">
        <div className="flex flex-col md:grid md:grid-cols-8 items-start md:items-center gap-4">
            <div className="w-full md:col-span-4 flex flex-col md:flex-row gap-1">
            <div className="flex flex-wrap gap-1.5 text-sm font-medium">
                <p>Prioritize files whose names match this</p>
                <Badge variant='secondary'>keyword</Badge>
                <p>or</p>
                <Badge variant='secondary'>regex</Badge>
                <p>pattern.</p>
            </div>
            </div>
            <div className="w-full md:col-span-4 flex flex-row gap-3">
            <Input
                placeholder="Keyword or Regex"
                value={displayValue || ""}
                onBlur={(e) => onSubmit(e.target.value ? e.target.value : null)}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1"
            />
            {displayValue && (
                <LoadingButton
                    isLoading={isLoading}
                    variant="destructive"
                    className="w-fit"
                    onClick={() => {
                        onSubmit(null)
                        onChange(null)
                    }}
                >
                    <X />
                </LoadingButton>
            )}
            </div>
        </div>
        </div>
    )
}