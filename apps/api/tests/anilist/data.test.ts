import { expect, test } from "bun:test";
import { getAnilistAnime } from "../../src/services/anilist";

test("returns episodes data", async () => {
  const anilistData = await getAnilistAnime(21)

  expect(anilistData).not.toBeEmpty()
});