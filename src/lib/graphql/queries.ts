import { gql } from "@apollo/client";

export const GET_ANIME = gql`
  query($id: Int!) {
    Media(id: $id) {
      id
      idMal
      bannerImage
      format
      episodes
      title {
        romaji
        english
      }
      nextAiringEpisode {
        episode
        airingAt
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
      streamingEpisodes {
        title
        thumbnail
      }
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
    $sort: [MediaSort] = [POPULARITY_DESC, SCORE_DESC]
    $status: MediaStatus
    $genres: [String]
    $tags: [String]
    $seasonYear: Int
    $format: MediaFormat
    $season: MediaSeason
    $isAdult: Boolean
    $source: MediaSource
    $countryOfOrigin: CountryCode
    $averageScore: Int
    $search: String
    
    $includeDescription: Boolean = true
    $includeBanner: Boolean = false
    $includeMediumCover: Boolean = false
    $includeLargeCover: Boolean = true
    $includeExtraLargeCover: Boolean = false
    $includeSeasonYear: Boolean = true
    $includeAverageScore: Boolean = true
    $includeStatus: Boolean = true
    $includeGenres: Boolean = true
    $includeTags: Boolean = true
    $includeSeason: Boolean = true
    $includePopularity: Boolean = false
    $includeEpisodes: Boolean = false
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(
        type: ANIME
        sort: $sort
        status: $status
        genre_in: $genres
        tag_in: $tags
        seasonYear: $seasonYear
        format: $format
        season: $season
        isAdult: $isAdult
        source: $source
        countryOfOrigin: $countryOfOrigin
        averageScore: $averageScore
        search: $search
      ) {
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
        genres @include(if: $includeGenres)
        tags @include(if: $includeTags) {
          name
        }
        season @include(if: $includeSeason)
        popularity @include(if: $includePopularity)
        episodes @include(if: $includeEpisodes)
      }
    }
  }
`;