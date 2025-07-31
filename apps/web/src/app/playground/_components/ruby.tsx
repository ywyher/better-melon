import { Button } from "@/components/ui/button";
import KuromojiAnalyzer from "@sglkc/kuroshiro-analyzer-kuromoji";
import Kuroshiro from "@sglkc/kuroshiro"
import { useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingButton from "@/components/loading-button";
import { parseRuby } from "@/lib/utils/subtitle";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { hasChanged } from "@/lib/utils/utils";
import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/components/transcriptions/transcriptions";
import DefinitionCard from "@/components/definition-card/definition-card";

export default function RubyPlayground() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);

  useEffect(() => {
    setActiveTranscriptions(['japanese', 'hiragana', 'english']);
    setActiveSubtitleFile({
      file: {
        last_modified: "2024-04-28T16:23:56.084911647Z",
        name: "メイドインアビス.S01E08.生存訓練.WEBRip.Netflix.ja[cc].srt",
        size: 26924,
        url: "https://jimaku.cc/entry/1323/download/%E3%83%A1%E3%82%A4%E3%83%89%E3%82%A4%E3%83%B3%E3%82%A2%E3%83%93%E3%82%B9.S01E08.%E7%94%9F%E5%AD%98%E8%A8%93%E7%B7%B4.WEBRip.Netflix.ja%5Bcc%5D.srt"
      },
      source: 'remote'
    });
    setEnglishSubtitleUrl("https://megacloudforest.xyz/subtitle/089753b2f5c4dcede26bad56385be9cd/eng-3.vtt")
  }, [setActiveTranscriptions, setActiveSubtitleFile]);

  const { isInitialized } = useInitializeTokenizer()
  const { transcriptions, transcriptionsLookup } = useSubtitleTranscriptions(isInitialized)

  const setTranscriptions = useWatchDataStore((state) => state.setTranscriptions)
  const setTranscriptionsLookup = useWatchDataStore((state) => state.setTranscriptionsLookup)
  const store = useWatchDataStore.getState(); // use this to read current store values (won't trigger re-renders)

  useEffect(() => {
    if (transcriptionsLookup && hasChanged(transcriptionsLookup, store.transcriptionsLookup)) {
      console.log(`[TranscriptionsLookup]`, transcriptionsLookup)
      setTranscriptionsLookup(transcriptionsLookup);
    }
  }, [transcriptionsLookup]);

  useEffect(() => {
    if (transcriptions && hasChanged(transcriptions, store.transcriptions)) {
      setTranscriptions(transcriptions);
    }
  }, [transcriptions]);

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const convert = async () => {
    setIsLoading(true)
    try {
      const kuroshiro = new Kuroshiro();
      await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict' }));

      const converted = await kuroshiro.convert(
        '度し難い',
        {
          mode: 'furigana'
        }
      )

      const parsed = parseRuby(converted, true)
      console.log(parsed)
    } catch(error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <LoadingButton
        isLoading={isLoading}
        onClick={async () => await  convert()}
      >
        Convert
      </LoadingButton>
      <SubtitleTranscriptions />
      <DefinitionCard />
    </>
  )
}