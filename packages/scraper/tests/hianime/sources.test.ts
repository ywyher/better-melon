import Hianime from "../../src/hianime";
import { expect, test } from "bun:test";

test("hianime anime episode sources", async () => {
  const hianime = new Hianime()
  const episodeId = 8775
  const servers = await hianime.getEpisodeServers({ episodeId })
  const server = servers.dub[0]
  if(!server) return;
  const sources = await hianime.getEpisodeSources({ 
    episodeId,
    server,
    fallback: true
  })

  console.log(sources)

  expect(servers).not.toBeEmpty()
  expect(sources).not.toBeEmpty()
});
