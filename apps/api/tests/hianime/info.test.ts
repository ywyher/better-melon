import { expect, test } from "bun:test";
import { getHianimeAnimeInfo } from "../../src/services/hianime";
import { getAnilistAnime } from "../../src/services/anilist";

test("returns anime info", async () => {
    const anilistData = await getAnilistAnime(9253)
    const info = await getHianimeAnimeInfo(anilistData)

    // console.log(info)

    expect(anilistData).not.toBeEmpty()
    expect(info.id).not.toBeEmpty()
});