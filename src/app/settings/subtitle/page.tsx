"use client"

import SubtitleSettingsForm from "@/app/settings/subtitle/components/subtitle-settings-form"
import { useQuery } from "@tanstack/react-query"

export default function SubtitleSettings() {

    const { data, isLoading } = useQuery({
        queryKey: ['subtitle', 'settings'],
        queryFn: async () => {
            return await getGlobalSubtitleSettings();
        }
    })

    return (
        <SubtitleSettingsForm />
    )
}