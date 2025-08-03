import { expect, test } from "bun:test";
import { getAnilistAnime } from "../../src/services/anilist";
import { getHianimeEpisodes, getHianimeEpisodeServers, getHianimeEpisodeSources, getHianimeInfo } from "../../src/services/hianime";

test("returns episodes data", async () => {
    const episodeNumber = 1;
    const anilistData = await getAnilistAnime({ anilistId: 9253 })
    const info = await getHianimeInfo({ anilistData })
    const episodes = await getHianimeEpisodes({ animeId: info.id })
    const episode = episodes.find(e => e.number == episodeNumber)
    if(!episode) throw new Error("Episode not found")
    const servers = await getHianimeEpisodeServers({
      episodeId: episode?.id
    });
    const sources = await getHianimeEpisodeSources({
        episodeId: episode.id,
        servers: servers
    })

    expect(anilistData).not.toBeEmpty()
    expect(info.id).not.toBeEmpty()
    expect(episodes).not.toBeEmpty()
    expect(sources.sources).not.toBeEmpty()
    expect(sources.tracks).not.toBeEmpty()
});