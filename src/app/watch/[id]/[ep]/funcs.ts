import { fetchSubtitles, parseSrt, parseVtt } from "@/lib/fetch-subs";
import { SkipTime } from "@/types/anime";
import { SubtitleFile } from "@/types/subtitle";
import { franc } from "franc-min";

export const filterSubtitleFiles = (files: SubtitleFile[]) => {
  const subtitleExtensions = ['srt', 'ass', 'vtt'];
  
  return files.filter(file => {
    const filename = file.name;
    
    // Check if file has a subtitle extension
    const extension = filename.split('.').pop()?.toLowerCase();
    const isSubtitleFile = extension && subtitleExtensions.includes(extension);
    
    if (!isSubtitleFile) return false;
    
    // Check for patterns that indicate multiple episodes
    const containsMultipleEpisodes = (
      // Pattern like "01-04" indicating episode range
      /\d+-\d+/.test(filename) ||
      // Other potential patterns for multiple episodes
      filename.includes("(1-") ||
      filename.includes(" 1-") ||
      /E\d+-E\d+/i.test(filename)  // Pattern like "E01-E04"
    );
    
    // Return true only if it's a subtitle file AND doesn't contain multiple episodes
    return !containsMultipleEpisodes;
  });
};

export const selectSubtitleFile = (files: SubtitleFile[]) => {
  if (!files || files.length === 0) {
    return null;
  }
  
  // Helper function to check for Netflix keyword
  const hasNetflixKeyword = (file: SubtitleFile) => {
    return file.name.toLowerCase().includes('netflix');
  };
  
  // Filter by file extensions
  const srtFiles = files.filter(file => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension === 'srt';
  });
  
  const vttFiles = files.filter(file => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension === 'vtt';
  });
  
  // First priority: SRT files
  if (srtFiles.length > 0) {
    // Check if any SRT files have Netflix keyword
    const netflixSrt = srtFiles.find(hasNetflixKeyword);
    if (netflixSrt) {
      return netflixSrt;
    }
    return srtFiles[0];
  }
  
  // Second priority: VTT files
  if (vttFiles.length > 0) {
    // Check if any VTT files have Netflix keyword
    const netflixVtt = vttFiles.find(hasNetflixKeyword);
    if (netflixVtt) {
      return netflixVtt;
    }
    return vttFiles[0];
  }
  
  // Last resort: return first file
  return files[0];
};

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

type GenerateWebVTTFromSkipTimesProps = {
  skipTimes: SkipTime[];
  totalDuration: number;
  episode: {
    title: string;
    number: number
  }
}

export function generateWebVTTFromSkipTimes({
    skipTimes,
    totalDuration,
    episode
}: GenerateWebVTTFromSkipTimesProps): string {
    let vttString = 'WEBVTT\n\n';
    let previousEndTime = 0;

    const sortedSkipTimes = skipTimes.sort(
        (a: SkipTime, b: SkipTime) => a.interval.startTime - b.interval.startTime,
    );

    sortedSkipTimes.forEach((skipTime: SkipTime, index: number) => {
        const { startTime, endTime } = skipTime.interval;
        const skipType =
        skipTime.skipType.toUpperCase() === 'OP' ? 'Opening' : 'Outro';

        // Insert default title chapter before this skip time if there's a gap
        if (previousEndTime < startTime) {
            vttString += `${formatTime(previousEndTime)} --> ${formatTime(startTime)}\n`;
            vttString += `${episode.title} - Episode ${episode.number}\n\n`;
        }

        // Insert this skip time
        vttString += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        vttString += `${skipType}\n\n`;
        previousEndTime = endTime;

        // Insert default title chapter after the last skip time
        if (index === sortedSkipTimes.length - 1 && endTime < totalDuration) {
            vttString += `${formatTime(endTime)} --> ${formatTime(totalDuration)}\n`;
            vttString += `${episode.title} - Episode ${episode.number}\n\n`;
        }
    });

    return vttString;
}

export async function isFileJpn(file: File) {
  const content = await fetchSubtitles(file)

  let parsed
  if(file.name.split('.').pop() == 'srt') {
    parsed = parseSrt(content)
  }else if(file.name.split('.').pop() == 'vtt') {
    parsed = parseVtt(content)
  }

  if(!parsed) return;

  const toBeTested = parsed?.slice(0, Math.ceil(parsed?.length / 2))
    .map((cue) => cue.content)
    .join(' ')

  const result = franc(toBeTested)

  return result == 'jpn' ? true : false
}