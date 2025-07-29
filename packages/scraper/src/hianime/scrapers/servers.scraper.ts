import ky from "ky";
import { hianimeConfig } from "../utils/config";
import { load } from "cheerio";
import type { GetEpisodeServersProps, HianimeEpiosdeServersApiReponse } from "../types/server";
import type { HianimeEpisodeServers, HianimeServerName } from "@better-melon/shared/types";

export async function getHianimeEpisodeServers({
  episodeId
}: GetEpisodeServersProps) {
  const content: HianimeEpiosdeServersApiReponse = await ky.get(
    `${hianimeConfig.url.ajax}/episode/servers?episodeId=${episodeId}`
  ).json();

  const $ = load(content.html)

  const servers: HianimeEpisodeServers = {
    sub: [],
    dub: [],
    raw: []
  }

  $(`.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item`).each(
      (_, item) => {
        servers.sub.push({
          id: Number($(item)?.attr("data-server-id")?.trim()) || null,
          dataId: Number($(item).attr("data-id")) || null, // will be used to get the streaming links later
          name: $(item).find("a").text().toLowerCase().trim() as HianimeServerName,
        });
      }
  );

  $(`.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item`).each(
    (_, item) => {
      servers.dub.push({
        id: Number($(item)?.attr("data-server-id")?.trim()) || null,
        dataId: Number($(item).attr("data-id")) || null,
        name: $(item).find("a").text().toLowerCase().trim() as HianimeServerName,
    });
    }
  );

  $(`.ps_-block.ps_-block-sub.servers-raw .ps__-list .server-item`).each(
    (_, item) => {
      servers.raw.push({
        id: Number($(item)?.attr("data-server-id")?.trim()) || null,
        dataId: Number($(item).attr("data-id")) || null,
        name: $(item).find("a").text().toLowerCase().trim() as HianimeServerName,
      });
    }
  );

  return servers;
}