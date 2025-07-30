export type OriginalNHKEntry = [
  string,
  string,
  {
    pitches: {
      position: number;
      devoice: any[];
      nasal: any[];
    }[];
    reading: string;
  }
];


export type NHKEntry = {
  word: string;
  type: string;
  reading: string;
  pitches: {
    position: number;
    devoice: number[];
    nasal: number[];
  }[];
}