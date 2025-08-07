import StreamingDetails from "@/app/watch/[id]/[ep]/components/episode/details/details";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import { useEffect } from "react";

export default function StreamingDetailsPlayground() {
  const setEpisodeNumber = useStreamingStore((state) => state.setEpisodeNumber)
  const setStreamingData = useStreamingStore((state) => state.setStreamingData)

  useEffect(() => {
    setEpisodeNumber(5)
    setStreamingData(  {
    "provider": "hianime",
      "anime": {
        "id": 20661,
        "title": {
          "english": "Terror in Resonance",
          "romaji": "Zankyou no Terror",
          "native": "残響のテロル"
        },
        "format": "TV",
        "status": "FINISHED",
        "bannerImage": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20661-JwMKrCzeSTZ7.png",
        "coverImage": {
          "medium": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx20661-aCR7QgzDfOSI.png",
          "large": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20661-aCR7QgzDfOSI.png",
          "extraLarge": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20661-aCR7QgzDfOSI.png"
        },
        "episodes": 11,
        "nextAiringEpisode": null,
        "startDate": {
          "day": 11,
          "month": 7,
          "year": 2014
        },
        "endDate": {
          "day": 26,
          "month": 9,
          "year": 2014
        }
      },
      "episode": {
        "details": {
          "id": "114145",
          "type": "episodes",
          "links": {
            "self": "https://kitsu.io/api/edge/episodes/114145"
          },
          "attributes": {
            "synopsis": "As Lisa recuperates at Nine and Twelve's place, Sphinx sets another bomb and posts another riddle, but things don't go as planned this time.",
            "description": "As Lisa recuperates at Nine and Twelve's place, Sphinx sets another bomb and posts another riddle, but things don't go as planned this time.",
            "titles": {
              "en_jp": "Hide & Seek",
              "en_us": "Hide & Seek",
              "ja_jp": "Hide & Seek"
            },
            "canonicalTitle": "Hide & Seek",
            "seasonNumber": 1,
            "number": 5,
            "relativeNumber": 5,
            "airdate": "2014-08-08",
            "length": 22,
            "thumbnail": {
              "original": "https://media.kitsu.app/episodes/thumbnails/114145/original.jpg"
            },
            "createdAt": "2014-03-30T23:42:28.215Z",
            "updatedAt": "2021-09-17T04:27:05.064Z"
          },
          "relationships": {
            "media": {
              "links": {
                "self": "https://kitsu.io/api/edge/episodes/114145/relationships/media",
                "related": "https://kitsu.io/api/edge/episodes/114145/media"
              }
            },
            "videos": {
              "links": {
                "self": "https://kitsu.io/api/edge/episodes/114145/relationships/videos",
                "related": "https://kitsu.io/api/edge/episodes/114145/videos"
              }
            }
          }
        },
        "sources": {
          "type": "SUB",
          "sources": {
            "file": "https://cdn.dotstream.buzz/anime/bca82e41ee7b0833588399b1fcd177c7/06131c7fd7dda0c6681d6c55752143af/master.m3u8",
            "type": "hls"
          },
          "tracks": [
            {
              "file": "https://megacloudforest.xyz/subtitle/2d66adc93c89dd5c0642c8c9c38d4ec8/eng-0.vtt",
              "label": "English",
              "kind": "captions",
              "default": true
            },
            {
              "file": "https://megacloudforest.xyz/thumbnails/b18bf2c5b69e4c2d14eacdcc9f4aaad0/thumbnails.vtt",
              "kind": "thumbnails"
            }
          ],
          "intro": {
            "start": 37,
            "end": 127
          },
          "outro": {
            "start": 1287,
            "end": 1377
          },
          "serverId": 4
        },
        "subtitles": [
          {
            "url": "https://jimaku.cc/entry/727/download/%5BKamigami%5D%20Zankyou%20no%20Terror%2001-11%20%5BBD%201080p%20x264%20AAC%20Subx3%5D.jpn.ass.rar",
            "name": "[Kamigami] Zankyou no Terror 01-11 [BD 1080p x264 AAC Subx3].jpn.ass.rar",
            "size": 114137,
            "last_modified": "2024-03-03T16:17:00Z"
          },
          {
            "url": "https://jimaku.cc/entry/727/download/timed%20for%20%5BFFF%5D%20release%20Zankyou%20No%20Teroru%20%2001-11.zip",
            "name": "timed for [FFF] release Zankyou No Teroru  01-11.zip",
            "size": 88943,
            "last_modified": "2024-03-03T16:16:59Z"
          },
          {
            "url": "https://jimaku.cc/entry/727/download/Zankyou%20no%20Terror%20(01-11)%20(Webrip).zip",
            "name": "Zankyou no Terror (01-11) (Webrip).zip",
            "size": 94304,
            "last_modified": "2024-03-03T16:16:59Z"
          },
          {
            "url": "https://jimaku.cc/entry/727/download/Zankyou%20No%20Teroru%20005.srt",
            "name": "Zankyou No Teroru 005.srt",
            "size": 25188,
            "last_modified": "2024-03-03T16:17:00Z"
          }
        ]
      }
    })
  }, [])
  
  return (
    <StreamingDetails />
  )
}