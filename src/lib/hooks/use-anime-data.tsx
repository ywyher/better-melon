import { Anime } from "@/types/anime";
import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";

const GET_ANIME_DATA = gql`
  query($id: Int!) {
    Media(id: $id) {
      id
      idMal
      bannerImage
      format
      title {
        romaji
        english
      }  
      episodes
      coverImage {
        large
        medium
      }
      description
      genres
      status
      season
      seasonYear
    } 
  }
`;

export function useAnimeData(animeId: string) {
  const {
    loading: isLoadingAnime, 
    error: animeError, 
    data: animeData 
  } = useQuery(GET_ANIME_DATA, { 
    variables: { id: Number(animeId) },
    fetchPolicy: 'cache-first',
  });

  return { animeData: animeData?.Media as Anime, isLoadingAnime, animeError };
}