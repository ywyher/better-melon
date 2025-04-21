import { anki } from "@/lib/queries/anki";
import { player } from "@/lib/queries/player";
import { settings } from "@/lib/queries/settings";
import { subtitle } from "@/lib/queries/subtitle";
import { user } from "@/lib/queries/user";
import { mergeQueryKeys } from "@lukemorales/query-key-factory";

export const queries = mergeQueryKeys(
    user, 
    anki,
    player,
    subtitle,
    settings
);