import { SubtitleCue } from "@/types/subtitle";
import nlp from "compromise";

export function tokenizeEnglishSubtitles(cues: SubtitleCue[]): SubtitleCue[] {
  return cues.map(sub => {
    if (!sub.content) {
      return sub;
    }
    
    const doc = nlp(sub.content);
    const terms = doc.terms().out('array');
    const tags = doc.terms().out('tags');
    
    const tokens = terms.map((term: string, index: number) => {
      const tagSet = tags[index] || {};
      const primaryPos = Object.keys(tagSet)[0] || "word";
      
      return {
        id: index,
        word_id: index,
        surface_form: term,
        original_form: term,
        pos: primaryPos,
        basic_form: doc.terms().eq(index).normalize().out('text'),
        word_type: "word",
        word_position: index,
        pos_detail_1: Object.keys(tagSet).join(','),
        pos_detail_2: "",
        pos_detail_3: "",
        conjugated_type: tagSet.Verb ? "verb" : "",
        conjugated_form: ""
      };
    });
    
    return {
      ...sub,
      transcription: 'english',
      tokens
    };
  });
}