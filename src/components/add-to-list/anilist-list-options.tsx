// import { Anime } from "@/types/anime";
// import { gql } from "@apollo/client";

// const ADD_ANIME = gql`
//     mutation SaveMediaListEntry(
//         $listEntryId: Int,
//         $mediaId: Int,
//         $status: MediaListStatus,
//         $progress: Int,
//         $startedAt: FuzzyDateInput,
//         $completedAt: FuzzyDateInput,
//         $score: Float,
//         $repeat: Int,
//         $notes: String
//     ) {
//     SaveMediaListEntry(
//         id: $listEntryId,
//         mediaId: $mediaId,
//         status: $status,
//         progress: $progress,
//         startedAt: $startedAt,
//         completedAt: $completedAt,
//         score: $score,
//         repeat: $repeat,
//         notes: $notes
//     ) {
//         id
//         status
//         progress
//         startedAt {
//             year
//             month
//             day
//         }
//         completedAt {
//             year
//             month
//             day
//         }
//         score
//         repeat
//         notes
//     }
//     }
// `

// export default function AnilistListOptions({ animeId }: { animeId: Anime['id'] }) {
    
//     return (
//         <>
//         </>
//     )
// }