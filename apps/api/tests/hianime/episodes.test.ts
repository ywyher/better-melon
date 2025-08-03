import { expect, test } from "bun:test";
import { getAnilistAnime } from "../../src/services/anilist";
import { getHianimeEpisodes, getHianimeInfo } from "../../src/services/hianime";

test("returns episodes data", async () => {
    const anilistData = await getAnilistAnime({
        anilistId: 9253
    })
    const info = await getHianimeInfo({ anilistData })
    const episodes = await getHianimeEpisodes({
        animeId: info.id
    })

    expect(anilistData).not.toBeEmpty()
    expect(info.id).not.toBeEmpty()
    expect(episodes).not.toBeEmpty()
});