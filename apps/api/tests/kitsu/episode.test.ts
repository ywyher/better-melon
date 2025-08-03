import { expect, test } from "bun:test";
import { getAnilistAnime } from "../../src/services/anilist";
import { getKitsuEpisode, getKitsuInfo } from "../../src/services/kitsu";

test("returns anime episode data from kitsu", async () => {
    const anilistData = await getAnilistAnime({ anilistId: 9253 })
    const info = await getKitsuInfo({ anilistData })
    const episode = await getKitsuEpisode({
      kitsuAnimeId: info.id,
      episodeNumber: 5
    })

    expect(anilistData).not.toBeEmpty()
    expect(info).not.toBeEmpty()
    expect(episode).not.toBeEmpty()
});