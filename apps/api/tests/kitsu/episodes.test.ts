import { expect, test } from "bun:test";
import { getKitsuAnimeEpisodes, getKitsuAnimeInfo } from "../../src/services/kitsu";
import { getAnilistAnime } from "../../src/services/anilist";

test("returns anime episodes data from kitsu", async () => {
    const anilistData = await getAnilistAnime(21)
    const info = await getKitsuAnimeInfo(anilistData)
    const { episodes } = await getKitsuAnimeEpisodes({
        kitsuAnimeId: info.id,
        anilistData,
        offset: 0,
        limit: 100
    })

    expect(anilistData).not.toBeEmpty()
    expect(info).not.toBeEmpty()
    expect(episodes).not.toBeEmpty()
}, { timeout: 30000 });