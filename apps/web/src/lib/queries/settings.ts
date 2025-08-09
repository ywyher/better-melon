import { getGeneralSettings } from "@/app/settings/general/actions";
import { getPlayerSettings } from "@/app/settings/player/actions";
import { getSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import { getWords } from "@/app/settings/word/_known-words/actions";
import { getWordSettings } from "@/app/settings/word/_settings/actions";
import { getSubtitleStyles } from "@/components/subtitle/styles/actions";
import { getSettingsForEpisode } from "@/lib/db/queries";
import { SubtitleStyles, Word } from "@/lib/db/schema";
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
    word: () => ({
        queryKey: ['word'],
        queryFn: async () => await getWordSettings(),
    }),
    subtitle: () => ({
        queryKey: ['subtitle'],
        queryFn: async () => await getSubtitleSettings(),
    }),
    subtitleStyles: (selectedTranscription: SubtitleStyles['transcription'], selectedState: SubtitleStyles['state']) => ({
      queryKey: ['settings', 'subtitle-styles', selectedTranscription, selectedState],
      queryFn: async () => {
        return await getSubtitleStyles({ transcription: selectedTranscription, state: selectedState });
      },
    }),
    forEpisode: () => ({
      queryKey: ['for-episode'],
      queryFn: async () => {
        return await getSettingsForEpisode()
      }
    }),
    words: ({ status }: { status?: Word['status'] }) => ({
      queryKey: ['words', status],
      queryFn: async () => {
        const { words } = await getWords({ status })
        return words
      }
    }),
})