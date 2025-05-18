import { gql } from "@apollo/client";

export const ADD_ANIME_TO_LIST = gql`
  mutation SaveMediaListEntry(
      $mediaId: Int,
      $status: MediaListStatus,
      $progress: Int,
      $startedAt: FuzzyDateInput,
      $completedAt: FuzzyDateInput,
      $score: Float,
      $repeat: Int,
      $notes: String
  ) {
  SaveMediaListEntry(
      mediaId: $mediaId,
      status: $status,
      progress: $progress,
      startedAt: $startedAt,
      completedAt: $completedAt,
      score: $score,
      repeat: $repeat,
      notes: $notes
  ) {
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
    }
  }
`