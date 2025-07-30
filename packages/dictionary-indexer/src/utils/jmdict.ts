import type { JMdictWord } from "@scriptin/jmdict-simplified-types";

export function addExtraJMdictInfo(data: JMdictWord[]): (JMdictWord & { isKana: boolean })[] {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  
  return data.map((item) => {
    const isKana = (!item.kanji || item.kanji.length === 0) && 
                   (item.kana && item.kana.length > 0);
    
    return {
      ...item,
      isKana,
    };
  });
}