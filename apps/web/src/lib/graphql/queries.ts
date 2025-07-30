import { gql } from "@apollo/client";

export const GET_ANIME = gql`
  query GetAnime(
    $id: Int!

    $withTitle: Boolean = false
    $withCoverImage: Boolean = false
    $withFormat: Boolean = false
    $withStatus: Boolean = false
    $withSeason: Boolean = false
    $withSeasonYear: Boolean = false
    
    $withGenres: Boolean = false
    $withAverageScore: Boolean = false
    $withBannerImage: Boolean = false
    $withDescription: Boolean = false
    $withEpisodes: Boolean = false
    $withDuration: Boolean = false
    $withStartDate: Boolean = false
    $withEndDate: Boolean = false
    $withNextAiringEpisode: Boolean = false
    $withStudios: Boolean = false
    $withCharacters: Boolean = false
    $withRelations: Boolean = false
    $withRecommendations: Boolean = false
    $withTrailer: Boolean = false
  ) {
    Media(id: $id) {
      # Core fields - ALWAYS included (no @include needed)
      id
      title @include(if: $withTitle) {
        romaji
        english
        native
      }
      coverImage @include(if: $withCoverImage) {
        large
        extraLarge
        medium
      }
      format @include(if: $withFormat)
      status @include(if: $withStatus)
      season @include(if: $withSeason)
      seasonYear @include(if: $withSeasonYear)
      
      bannerImage @include(if: $withBannerImage)
      description @include(if: $withDescription)
      episodes @include(if: $withEpisodes)
      duration @include(if: $withDuration)
      genres @include(if: $withGenres)
      averageScore @include(if: $withAverageScore)
      
      startDate @include(if: $withStartDate) {
        day
        month
        year
      }
      
      endDate @include(if: $withEndDate) {
        day
        month
        year
      }
      
      nextAiringEpisode @include(if: $withNextAiringEpisode) {
        episode
        airingAt
        timeUntilAiring
      }
      
      studios @include(if: $withStudios) {
        edges {
          isMain
          node {
            name
            isAnimationStudio
          }
        }
      }
      
      characters @include(if: $withCharacters) {
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
      
      relations @include(if: $withRelations) {
        edges {
          relationType
          node {
            id
            title {
              english
            }
            coverImage {
              medium
              large
              extraLarge
            }
            status
            format
          }
        }
      }
      
      recommendations @include(if: $withRecommendations) {
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
      
      trailer @include(if: $withTrailer) {
        thumbnail
        id
        site
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
    # Pagination
    $page: Int = 1
    $perPage: Int = 10
    
    # Filters
    $sorts: [MediaSort] = [POPULARITY_DESC, SCORE_DESC]
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
    $query: String
    
    # metadata
    $withTitle: Boolean = false
    $withCoverImage: Boolean = false
    $withFormat: Boolean = false
    $withDescription: Boolean = false
    $withBannerImage: Boolean = false
    $withSeason: Boolean = false
    $withSeasonYear: Boolean = false
    $withAverageScore: Boolean = false
    $withStatus: Boolean = false
    $withGenres: Boolean = false
    $withTags: Boolean = false
    $withPopularity: Boolean = false
    $withEpisodes: Boolean = false
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(
        type: ANIME
        sort: $sorts
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
        search: $query
      ) {
        # Core fields - ALWAYS included
        id

        # Metadata
        title @include(if: $withTitle) {
          english
          native
          romaji
        }
        
        coverImage @include(if: $withCoverImage) {
          medium
          large
          extraLarge
        }
        
        format @include(if: $withFormat)
        
        bannerImage @include(if: $withBannerImage)
        description(asHtml: false) @include(if: $withDescription)
        season @include(if: $withSeason)
        seasonYear @include(if: $withSeasonYear)
        averageScore @include(if: $withAverageScore)
        status @include(if: $withStatus)
        genres @include(if: $withGenres)
        
        tags @include(if: $withTags) {
          name
        }
        popularity @include(if: $withPopularity)
        episodes @include(if: $withEpisodes)
      }
    }
  }
`;