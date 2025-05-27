export class PlayerError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PlayerError';
  }
}

export class SubtitlesNotAvailableError extends PlayerError {
  constructor(episodeNumber: number) {
    super(
      `Japanese subtitles are not available for episode ${episodeNumber}`,
      'SUBTITLES_NOT_AVAILABLE'
    );
  }
}

export class FileSelectionError extends PlayerError {
  constructor() {
    super('Failed to select subtitle file', 'FILE_SELECTION_FAILED');
  }
}