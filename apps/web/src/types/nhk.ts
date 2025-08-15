export type NHKPitch = {
  position: number; // mora after which pitch drops (0 = Heiban)
  devoice: number[]; // mora positions that are devoiced
  nasal: number[];   // mora positions that are nasalized
};

export type NHKEntry = {
  word: string;
  type: string;
  reading: string;
  pitches: NHKPitch[]
}