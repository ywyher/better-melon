import { expect, test } from "bun:test";
import { getAnilistAnime } from "../../src/services/anilist";
import { getKitsuInfo } from "../../src/services/kitsu";

test("returns anime info from kitsu", async () => {
    const anilistData = await getAnilistAnime({ anilistId: 20661 })
    const data = await getKitsuInfo({ anilistData })

    expect(anilistData).not.toBeEmpty()
    expect(data).not.toBeEmpty()
});