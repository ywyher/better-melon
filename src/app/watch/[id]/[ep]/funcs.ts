import { File, JimakuFile } from "@/app/watch/[id]/[ep]/types";

export const filterFiles = (files: JimakuFile[]) => {
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

export const selectFile = (files: JimakuFile[]) => {
  if (!files || files.length === 0) {
    return null;
  }
  
  // First check if there are any SRT files
  const srtFiles = files.filter(file => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension === 'srt';
  });
  
  // If we have SRT files, return the first one
  if (srtFiles.length > 0) {
    return srtFiles[0];
  }
  
  // Otherwise, just return the first file from the list
  return files[0];
};