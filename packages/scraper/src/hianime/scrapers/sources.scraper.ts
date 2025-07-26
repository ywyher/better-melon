import ky from "ky";
import { hianimeConfig } from "../utils/config";
import { extractHianimeToken } from "../utils/sources.utils";
import { AES, enc } from "crypto-js";
import type { 
  GetHianimeEpisodeSourcesProps,
  HianimeEpiosdeSourcesApiResponse, 
  HianimeEpisodeSources, 
  HianimeGetSourcesApiResponse, 
  HianimeGetSourcesFallbackApiResponse 
} from "../types/sources";
import type { HianimeAnimeEpisode } from "../types/episodes";
import type { HianimeEpisodeServer } from "../types/servers";

async function getDefaultEpisodeSources(
  episodeId: HianimeAnimeEpisode['id'],
  server: HianimeEpisodeServer
): Promise<HianimeEpisodeSources> {
  const [sourcesData, key]: [HianimeEpiosdeSourcesApiResponse, string] = await Promise.all([
    ky.get(`${hianimeConfig.url.ajax}/episode/sources?id=${server.dataId}`).json<HianimeEpiosdeSourcesApiResponse>(),
    ky.get("https://raw.githubusercontent.com/itzzzme/megacloud-keys/refs/heads/main/key.txt").text()
  ]);

  const link = sourcesData.link;
  if (!link) throw new Error("Missing link in sourcesData");

  // https://megacloud.blog/embed-2/v3/e-1/CMBQ9K2xAacW?k=1 => CMBQ9K2xAacW
  const sourceIdMatch = /\/([^/?]+)\?/.exec(link);
  const sourceId = sourceIdMatch?.[1];
  if (!sourceId) throw new Error("Unable to extract sourceId from link");

  // https://megacloud.blog/embed-2/v3/e-1/CMBQ9K2xAacW?k=1 => https://megacloud.blog/embed-2/v3/e-1
  const baseUrlMatch = link.match(/^(https?:\/\/[^\/]+(?:\/[^\/]+){3})/);
  if (!baseUrlMatch) throw new Error("Could not extract base URL from link");
  
  const baseUrl = baseUrlMatch[1];
  if (!baseUrl) throw new Error("Unable to extract baseUrl from link");

  const token = await extractHianimeToken({
    baseUrl,
    sourceId
  });

  const data: HianimeGetSourcesApiResponse = await ky.get(`${baseUrl}/getSources?id=${sourceId}&_k=${token}`).json();
  
  const encrypted = data.sources;
  if (!encrypted) throw new Error("Encrypted source missing");

  const decrypted = AES.decrypt(encrypted, key.trim()).toString(enc.Utf8);
  if (!decrypted) throw new Error("Failed to decrypt source");

  return JSON.parse(decrypted);
}

async function getFallbackEpisodeSources(
  episodeId: HianimeAnimeEpisode['id'],
): Promise<HianimeEpisodeSources> {
  const iframe = `${hianimeConfig.url.fallback}/stream/s-2/${episodeId}/sub`;
  
  const content = await ky.get(iframe, {
    headers: {
      Referer: `${hianimeConfig.url.fallback}`,
    },
  }).text();

  const dataIdMatch = content.match(/data-id=["'](\d+)["']/);
  const epiosdeFallbackId = dataIdMatch?.[1];
  if (!epiosdeFallbackId) throw new Error("Could not extract data-id for fallback");

  const data: HianimeGetSourcesFallbackApiResponse = await ky.get(
    `${hianimeConfig.url.fallback}/stream/getSources?id=${epiosdeFallbackId}`,
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  ).json();


  const sources: HianimeEpisodeSources = {
    type: 'sub',
    sources: {
      ...data.sources,
      type: 'hls'
    },
    tracks: data.tracks ?? [],
    intro: data.intro ?? null,
    outro: data.outro ?? null,
    iframe,
    serverId: Number(data.server) ?? 0,
  };

  return sources;
}

export async function getHianimeEpisodeSources({
  episodeId,
  server,
  fallback = false,
}: GetHianimeEpisodeSourcesProps): Promise<HianimeEpisodeSources> {
  if (fallback) {
    return getFallbackEpisodeSources(episodeId);
  }

  try {
    return await getDefaultEpisodeSources(episodeId, server!);
  } catch (error) {
    return getFallbackEpisodeSources(episodeId);
  }
}