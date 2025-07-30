export type NHKPitch = {
  position: number;
  devoice: number[];
  nasal: number[];
}

export type NHKEntry = {
  word: string;
  type: string;
  reading: string;
  pitches: NHKPitch[]
}