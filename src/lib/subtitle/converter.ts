import CustomKuromojiAnalyzer from "@/lib/subtitle/custom-kuromoji-analyzer";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import { Tokenizer } from "kuromojin";

export async function convertSubtitlesForNonJapaneseTranscription(
  cues: SubtitleCue[], 
  transcription: SubtitleTranscription,
  tokenizer: Tokenizer
) {
  const kuroshiroStart = performance.now();
  const kuroshiro = new Kuroshiro();
  const analyzer = new CustomKuromojiAnalyzer({ tokenizer });
  await kuroshiro.init(analyzer);
  const kuroshiroEnd = performance.now();
  console.info(`[KuroshiroInitialization(${transcription})] Took: ${(kuroshiroEnd - kuroshiroStart).toFixed(2)}ms`);
  
  if (!kuroshiro) {
    throw new Error("Kuroshiro not initialized for transcription conversion");
  }

  const kuroshiroOptions = {
    to: transcription,
    mode: transcription === 'romaji' 
    ? 'spaced' 
    : transcription == 'furigana' 
    ? 'furigana'
    : 'normal' 
  }

  return Promise.all(
    cues.map(async sub => {
      if (!sub.content || !kuroshiro) {
        return sub;
      }
      
      const convertedContent = await kuroshiro.convert(sub.content, kuroshiroOptions);
      
      const convertedTokens = sub.tokens
        ? await Promise.all(
            sub.tokens
              .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
              .map(async token => {
                const convertedToken = await kuroshiro.convert(token.surface_form, kuroshiroOptions);
                return {
                  ...token,
                  original_form: token.surface_form,
                  surface_form: convertedToken
                };
              })
          )
        : [];
  
      return {
        ...sub,
        transcription: transcription,
        original_content: sub.content,
        content: convertedContent,
        tokens: convertedTokens
      };
    })
  );
}