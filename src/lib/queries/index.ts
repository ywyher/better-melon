import { ankiQueries } from "@/lib/queries/anki";
import { playerQueries } from "@/lib/queries/player";
import { settingsQueries } from "@/lib/queries/settings";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { userQueries } from "@/lib/queries/user";
import { mergeQueryKeys } from "@lukemorales/query-key-factory";

export const queries = mergeQueryKeys(
    userQueries, 
    ankiQueries,
    playerQueries,
    subtitleQueries,
    settingsQueries
);