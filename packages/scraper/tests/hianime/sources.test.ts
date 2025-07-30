import Hianime from "../../src/hianime";
import { expect, test } from "bun:test";

test("hianime anime episode sources", async () => {
  const hianime = new Hianime()
  const episodeId = 213
  const servers = await hianime.getEpisodeServers({ episodeId })
  const server = servers.sub[0]
  if(!server) return;
  const sources = await hianime.getEpisodeSources({ 
    episodeId,
    server,
    fallback: true
  })

  expect(servers).not.toBeEmpty()
  expect(sources).not.toBeEmpty()
});
