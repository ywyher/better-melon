import { getGeneralSettings } from "@/app/settings/general/actions";
import { getPlayerSettings } from "@/app/settings/player/actions";
import { getSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const settings = createQueryKeys('settings', {
    general: () => ({
        queryKey: ['general-settings'],
        queryFn: async () => await getGeneralSettings(),
    }),
    player: () => ({
        queryKey: ['player-settings'],
        queryFn: async () => await getPlayerSettings(),
    }),
    subtitle: () => ({
        queryKey: ['subtitle-settings'],
        queryFn: async () => await getSubtitleSettings(),
    }),
})