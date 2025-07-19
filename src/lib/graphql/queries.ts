import { gql } from "@apollo/client";

export const GET_ANIME = gql`
  query($id: Int!) {
    Media(id: $id) {
      id
      idMal
      bannerImage
      format
      episodes
      streamingEpisodes {
        title
        thumbnail
      }
      title {
        romaji
        english
      }
      nextAiringEpisode {
        episode
        timeUntilAiring
      }
      coverImage {
        large
        extraLarge
        medium
      }
      studios {
        edges {
          isMain
          node {
            name
            isAnimationStudio
          }
        }
      }
      characters {
        edges {
          node {
            name {
              first
              last
            }
            age
            image {
              large
            }
          }
          role
          voiceActors {
            name {
              first
              last
            }
            image {
              large
            }
          }
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            coverImage {
              medium
              large
              extraLarge
            }
            title {
              english
            }
            status
            format
          }
        }
      }
      recommendations {
        edges {
          node {
            mediaRecommendation {
              id
              title {
                english
              }
              coverImage {
                large
                extraLarge
                medium
              }
              status
              format
              averageScore
              seasonYear
            }
          }
        }
      }
      trailer {
        thumbnail
        id
        site
      }
      startDate {
        day
        month
        year
      }
      endDate {
        day
        month
        year
      }
      description
      genres
      status
      season
      seasonYear
      duration
      averageScore
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
`;

export const GET_ANIME_IN_LIST = gql`
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
`;

export const GET_ANIME_LIST = gql`
  query GetAnimeList(
    $page: Int = 1
    $perPage: Int = 10
    $sort: [MediaSort]
    $status: MediaStatus
    $includeDescription: Boolean = false
    $includeBanner: Boolean = false
    $includeMediumCover: Boolean = true
    $includeLargeCover: Boolean = true
    $includeExtraLargeCover: Boolean = false
    $includeSeasonYear: Boolean = false
    $includeAverageScore: Boolean = false
    $includeStatus: Boolean = false
  ) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: $sort, status: $status) {
        id
        format
        title {
          english
        }
        bannerImage @include(if: $includeBanner)
        coverImage {
          medium @include(if: $includeMediumCover)
          large @include(if: $includeLargeCover)
          extraLarge @include(if: $includeExtraLargeCover)
        }
        description(asHtml: false) @include(if: $includeDescription)
        seasonYear @include(if: $includeSeasonYear)
        averageScore @include(if: $includeAverageScore)
        status @include(if: $includeStatus)
      }
    }
  }
`;