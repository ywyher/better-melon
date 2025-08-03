import { expect, test } from "bun:test";
import { getAnilistAnime } from "../../src/services/anilist";
import { getHianimeInfo } from "../../src/services/hianime";

test("returns anime info", async () => {
    const anilistData = await getAnilistAnime({ anilistId: 11061 })
    const info = await getHianimeInfo({ anilistData })

    expect(anilistData).not.toBeEmpty()
    expect(info.id).not.toBeEmpty()
});