import { expect, test } from "bun:test";
import { getAnilistAnime } from "../../src/services/anilist";

test("returns episodes data", async () => {
  const anilistData = await getAnilistAnime({ anilistId: 21 })

  expect(anilistData).not.toBeEmpty()
});