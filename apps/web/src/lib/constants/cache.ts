import { sortObject } from "@/lib/utils/utils";
import { Anime, AnimeListQueryVariableKeys, AnimeListQueryVariables, AnimeQueryVariableKeys, AnimeQueryVariables } from "@/types/anime";

export const cacheKeys = {
  subtitle: ({
    animeId,
    episodeNumber,
    name
  }: {
    name: string,
    animeId: Anime['id'],
    episodeNumber: number
  }) => `subtitle:${animeId}:${episodeNumber}:${name}`,
  
  anime: {
    data: ({
      animeId,
      name,
      variables
    }: {
      animeId: Anime['id'],
      name: AnimeQueryVariableKeys
      variables: AnimeQueryVariables
    }) => {
      const sorted = sortObject({ object: variables, output: 'string' })
      return `anime:data:${animeId}:${name}:${sorted}`;
    },
    
    list: ({ name, variables }: { variables: AnimeListQueryVariables, name: AnimeListQueryVariableKeys }) => {
      return `anime:list:${name}:${sortObject({ object: variables, output: 'string' })}`;
    },
  },
  
  pitch: {
    accent: (animeId: string, filename: string, chunk: number) => `pitch:accent:${animeId}:${filename}:${chunk}`
  }
}