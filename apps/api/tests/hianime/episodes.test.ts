import { expect, test } from "bun:test";
import { getHianimeAnimeEpisodes, getHianimeAnimeInfo } from "../../src/services/hianime";
import { getAnilistAnime } from "../../src/services/anilist";

test("returns episodes data", async () => {
    const anilistData = await getAnilistAnime('9253')
    const info = await getHianimeAnimeInfo(anilistData)
    const episodes = await getHianimeAnimeEpisodes(info.id)

    expect(anilistData).not.toBeEmpty()
    expect(info.id).not.toBeEmpty()
    expect(episodes.episodes).not.toBeEmpty()
});