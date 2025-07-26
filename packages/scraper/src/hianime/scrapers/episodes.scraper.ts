import ky from "ky"
import { load } from "cheerio"
import { hianimeConfig } from "../utils/config"
import type { GetHianimeEpisodesProps, HianimeAnimeEpisode, HianimeEpiosdeListApiReponse } from "../types/episodes"

export async function getHianimeEpisodes({
  animeId
}: GetHianimeEpisodesProps): Promise<HianimeAnimeEpisode[]> {
  const id = animeId.split('-').pop() // steinsgate-3 => 3

  try {
    const content: HianimeEpiosdeListApiReponse = await ky.get(
      `${hianimeConfig.url.ajax}/episode/list/${id}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${hianimeConfig.url.watch}/${animeId}`,
        },
      }
    ).json()
    const $ = load(content.html)

    const episodes: HianimeAnimeEpisode[] = [];
  
    $('.detail-infor-content .ssl-item').each((_, item) => {
      episodes.push({
        id: Number(item.attribs['data-id']), 
        title: {
          english: item.attribs.title,
          native: $(item).find(".ep-name").attr("data-jname")
        },
        number: Number(item.attribs['data-number']),
        isFiller: $(item).hasClass("ssl-item-filler"),
      })
    });
  
    return episodes;
  } catch(e) {
    throw e;
  }
}