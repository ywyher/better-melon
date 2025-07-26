import { MultiSearchResult } from "meilisearch";

export function mergeResultsByIndex<T>(results: MultiSearchResult<T>[]): MultiSearchResult<T>[] {
  const merged = new Map<string, MultiSearchResult<T>>();
  
  results.forEach(result => {
    const key = result.indexUid;
    
    if (merged.has(key)) {
      const existing = merged.get(key)!;
      
      const existingHitIds = new Set(existing.hits.map((hit: any) => hit.id || JSON.stringify(hit)));
      const newHits = result.hits.filter((hit: any) => 
        !existingHitIds.has(hit.id || JSON.stringify(hit))
      );
      
      existing.hits = [...existing.hits, ...newHits];
      existing.estimatedTotalHits = Math.max(existing.estimatedTotalHits || 0, result.estimatedTotalHits || 0);
      existing.processingTimeMs += result.processingTimeMs;
      
      if (existing.query !== result.query) {
        existing.query = `${existing.query}, ${result.query}`;
      }
    } else {
      merged.set(key, { ...result });
    }
  });
  
  return Array.from(merged.values());
}