export function mergeJMnedictEntries(entries: any[]): any[] {
  const kanjiMap = new Map<string, any>();

  entries.forEach(entry => {
    if (!entry.kanji || entry.kanji.length === 0) {
      // Handle entries without kanji separately
      kanjiMap.set(`no-kanji-${entry.id}`, entry);
      return;
    }

    const kanjiText = entry.kanji[0].text;
    
    if (kanjiMap.has(kanjiText)) {
      const existing = kanjiMap.get(kanjiText);
      
      // Merge kana readings
      const existingKana = existing.kana.map((k: any) => k.text);
      entry.kana.forEach((kana: any) => {
        if (!existingKana.includes(kana.text)) {
          existing.kana.push(kana);
        }
      });
      
      // Merge translations
      existing.translation.push(...entry.translation);
      
    } else {
      kanjiMap.set(kanjiText, { ...entry });
    }
  });

  return Array.from(kanjiMap.values());
}