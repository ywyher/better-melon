import { expect, test } from "bun:test";
import { getHianimeAnime } from "../../../src/services/hianime";
import { getAnilistAnime } from "../../../src/services/anilist";
import { getKitsuAnime } from "../../../src/services/kitsu";
import { getSubtitleFiles } from "../../../src/services/subtitle";

test("test /anime/:anilistId/:episodeNumber/:provider", async () => {
    console.clear()
    console.log('*-----------------------------------------------------------------------------------*')
    const fetchStart = performance.now()

    const anilistId = 20661;
    const episodeNumber = 3
    const anilistData = await getAnilistAnime({ anilistId })
    
    const [hianimeAnime, kitsuAnime, subtitleFiles] = await Promise.all([
      getHianimeAnime({ anilistData, episodeNumber }),
      getKitsuAnime({ anilistData, episodeNumber }),
      getSubtitleFiles({  anilistData, episodeNumber })
    ])
    
    console.log({
      anilistData,
      hianimeAnime: hianimeAnime,
      kitsuAnime: kitsuAnime,
      subtitleFiles
    })

    const fetchEnd = performance.now()
    console.log(`Fetched data in ${(fetchEnd - fetchStart).toFixed(2)}ms`);

    expect(anilistData).not.toBeEmpty()
    expect(hianimeAnime).not.toBeEmpty()
    expect(kitsuAnime).not.toBeEmpty()
    expect(subtitleFiles).not.toBeEmpty()
    expect(anilistData).not.toBeEmpty()
}, { timeout: 30000 });