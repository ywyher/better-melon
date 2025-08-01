import Hianime from "../../src/hianime";
import { expect, test } from "bun:test";

test("hianime anime episode servers", async () => {
  const hianime = new Hianime()
  const episodeId = 213
  const servers = await hianime.getEpisodeServers({ episodeId })

  console.log(servers)

  expect(servers).not.toBeEmpty()
});