import { GeneralSettings } from "@/lib/db/schema";

export const screenshotFormats = ['png', 'jpeg', 'webp']

export const defaultGeneralSettings: GeneralSettings =  {
    id: '',
    hideSpoilers: false,
    syncSettings: 'ask' as GeneralSettings['syncSettings'],
    screenshotNamingDialog: true,
    screenshotNamingPattern: "better_melon_{title}_{counter}_{random}",
    screenshotFormat: 'png',
    userId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
}