'use client'

import { SelectInput } from "@/components/form/select-input"
import LoadingButton from "@/components/loading-button"
import { subtitleFormats } from "@/lib/constants/subtitle"
import { SubtitleSettings } from "@/lib/db/schema"
import { useSubtitleSettings } from "@/lib/hooks/use-subtitle-settings"
import { X } from "lucide-react"
  
export default function PreferredFormat({ value }: { 
    value: SubtitleSettings['preferredFormat']
 }) {
    const { displayValue, isLoading, onSubmit } = useSubtitleSettings({
        field: 'preferredFormat',
        initialValue: value,
    })

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col md:grid md:grid-cols-8 items-start md:items-center gap-4">
                <div className="w-full md:col-span-4 text-sm font-medium">
                    Preferred format
                </div>
                <div className="w-full md:col-span-4 flex flex-row gap-3">
                    <SelectInput 
                        value={displayValue || ""}
                        onChange={v => onSubmit(v as SubtitleSettings['preferredFormat'])}
                        disabled={isLoading}
                        options={subtitleFormats.map((f) => {
                            return {
                                value: f,
                                label: f
                            }
                        })}
                    />
                    {value && (
                        <LoadingButton
                            isLoading={isLoading}
                            variant="destructive"
                            className="w-fit"
                            onClick={() => onSubmit(null)}
                        >
                        <X />
                        </LoadingButton>
                    )}
                </div>
            </div>
        </div>
    )
}