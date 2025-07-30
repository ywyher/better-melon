import Hianime from "../../src/hianime";
import { expect, test } from "bun:test";

test("hianime anime episodes", async () => {
  const hianime = new Hianime()
  const animeId = 'steinsgate-3'
  const episodes = await hianime.getEpisodes({ animeId })

  expect(episodes).not.toBeEmpty()
});