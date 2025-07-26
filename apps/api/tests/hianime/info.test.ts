import { expect, test } from "bun:test";
import { getHianimeAnimeInfo } from "../../src/services/hianime";
import { getAnilistAnime } from "../../src/services/anilist";

test("returns anime info", async () => {
    const anilistData = await getAnilistAnime('21')
    const data = await getHianimeAnimeInfo(anilistData)

    expect(anilistData).not.toBeEmpty()
    expect(data.id).not.toBeEmpty()
});