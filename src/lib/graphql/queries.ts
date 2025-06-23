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
      nextAiringEpisode {
        episode
        timeUntilAiring
      }
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

export const GET_ANIME_DYNAMIC_DATA = gql`
  query($id: Int!) {
    Media(id: $id) {
      status
      episodes
    } 
  }
`

export const GET_ANIME_FROM_LIST = gql`
  query GetAnimeList (
    $mediaId: Int!,
    $userId: Int!,
    $type: MediaType
  ){
    MediaList(
      mediaId: $mediaId,
      userId: $userId,
      type: $type
    ) {
      media {
        mediaListEntry {
          id
        }
        episodes
      }
      status
      progress
      startedAt {
        year
        month
        day
      }
      completedAt {
        year
        month
        day
      }
      score
      repeat
      notes
      user {
        id
      }
    }
  }
`