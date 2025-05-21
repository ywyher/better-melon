import { getGeneralSettings } from "@/app/settings/general/actions";
import { getPlayerSettings } from "@/app/settings/player/actions";
import { getSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import { getSubtitleStyles } from "@/components/subtitle/styles/actions";
import { getSettingsForEpisode } from "@/lib/db/queries";
import { SubtitleStyles } from "@/lib/db/schema";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const settingsQueries = createQueryKeys('settings', {
    general: () => ({
        queryKey: ['general'],
        queryFn: async () => await getGeneralSettings(),
    }),
    player: () => ({
        queryKey: ['player'],
        queryFn: async () => await getPlayerSettings(),
    }),
    subtitle: () => ({
        queryKey: ['subtitle'],
        queryFn: async () => await getSubtitleSettings(),
    }),
    subtitleStyles: (selectedTranscription: SubtitleStyles['transcription']) => ({
      queryKey: ['settings', 'subtitle-styles', selectedTranscription],
      queryFn: async () => {
        return await getSubtitleStyles({ transcription: selectedTranscription });
      },
    }),
    forEpisode: () => ({
      queryKey: ['for-episode'],
      queryFn: async () => {
        return await getSettingsForEpisode()
      }
    })
})