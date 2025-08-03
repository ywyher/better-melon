import { expect, test } from "bun:test";
import { getAnilistAnime } from "../../src/services/anilist";
import { getKitsuEpisodes, getKitsuInfo } from "../../src/services/kitsu";

test("returns anime episodes data from kitsu", async () => {
    const anilistData = await getAnilistAnime({ anilistId: 21 })
    const info = await getKitsuInfo({ anilistData })
    const { episodes } = await getKitsuEpisodes({
        kitsuAnimeId: info.id,
        anilistData,
        offset: 0,
        limit: 100
    })

    expect(anilistData).not.toBeEmpty()
    expect(info).not.toBeEmpty()
    expect(episodes).not.toBeEmpty()
}, { timeout: 30000 });