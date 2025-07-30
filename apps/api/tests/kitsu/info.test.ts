import { expect, test } from "bun:test";
import { getKitsuAnimeInfo } from "../../src/services/kitsu";
import { getAnilistAnime } from "../../src/services/anilist";

test("returns anime info from kitsu", async () => {
    const anilistData = await getAnilistAnime(9253)
    const data = await getKitsuAnimeInfo(anilistData)

    expect(anilistData).not.toBeEmpty()
    expect(data).not.toBeEmpty()
});