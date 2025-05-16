import { gql } from "@apollo/client";

export const GET_ANIME = gql`
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
      }
      description
      genres
      status
      season
      seasonYear
    }
  }
`;