import type { SubtitleCue, SubtitleTranscription, SubtitleFormat, ParseSubtitleBody } from "@/types/subtitle";
import { readFileContent } from "@/lib/utils/utils";
import { parseSubtitleCues } from "@/lib/subtitle/actions";
import { CacheKey } from "@/types";

export function getSubtitleCacheKey({
  source, 
  isFile,
  lastModified
}: {
  source: string, 
  isFile: boolean,
  lastModified?: number
}): CacheKey {
  if (isFile && lastModified) {
    return `file-${source}-${lastModified}`;
  }
  return source;
}

export async function parseSubtitleToJson({
  source,
  format,
  transcription = 'japanese',
}: {
  source: string | File,
  format: SubtitleFormat,
  transcription: SubtitleTranscription
}): Promise<SubtitleCue[]> {
  let body: ParseSubtitleBody = {
    source: typeof source === 'string' ? source : source.name,
    format,
    transcription,
    isFile: typeof source !== 'string'
  };
  
  // If it's a file, read its content and include metadata
  if (typeof source !== 'string') {
    body.fileContent = await readFileContent(source);
    body.lastModified = source.lastModified;
  }

  const cues = await parseSubtitleCues({
    ...body
  })
  
  return cues
}