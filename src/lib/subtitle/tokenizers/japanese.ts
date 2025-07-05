'use server'

import { initializeTokenizer } from "@/lib/subtitle/actions";
import { SubtitleCue, SubtitleToken, SubtitleTranscription } from "@/types/subtitle";

export async function tokenizeJapaneseSubtitles(subs: SubtitleCue[], transcription: SubtitleTranscription): Promise<SubtitleCue[]> {
  const currentTokenizer = await initializeTokenizer(transcription);
  
  if (!currentTokenizer) {
    throw new Error("Tokenizer initialization failed");
  }
  
  const results = [];

  for (const sub of subs) {
    const rawTokens = currentTokenizer.tokenize(sub.content || '');
    
    const tokens = rawTokens
      .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
      .map((token, index) => ({
        ...token,
        original_form: token.surface_form,
        id: `${sub.id}-${index}`
      })) as SubtitleToken[];
    
    results.push({
      ...sub,
      tokens
    });
  }
  
  return results;
}