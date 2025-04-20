import { GeneralSettings } from "@/lib/db/schema";

export const defaultGeneralSettings: GeneralSettings =  {
    id: '',
    syncPlayerSettings: 'ask' as GeneralSettings['syncPlayerSettings'],
    userId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
}