import { expect, test } from "bun:test";
import { getSubtitleEntries } from "../../src/services/subtitle";

test("test subtitles entires", async () => {
  const entries = await getSubtitleEntries({ anilistId: 178433 })

  expect(entries).not.toBeEmpty()
});