import { GeneralSettings } from "@/lib/db/schema";

export const screenshotFormats = ['png', 'jpeg', 'webp']

export const defaultGeneralSettings: GeneralSettings =  {
    id: '',
    hideSpoilers: false,
    syncPlayerSettings: 'ask' as GeneralSettings['syncPlayerSettings'],
    screenshotNamingDialog: true,
    screenshotNamingPattern: "better_melon_{title}_{counter}_{random}",
    screenshotFormat: 'png',
    userId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
}