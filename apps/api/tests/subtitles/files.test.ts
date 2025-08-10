import { expect, test } from "bun:test";
import { getSubtitleFiles } from "../../src/services/subtitle";
import { getAnilistAnime } from "../../src/services/anilist";

test("test subtitles entires", async () => {
  const anilistData = await getAnilistAnime({ anilistId: 178433 })
  const files = await getSubtitleFiles({ anilistData, episodeNumber: 1 })

  expect(anilistData).not.toBeEmpty()
  expect(files).not.toBeEmpty()
});