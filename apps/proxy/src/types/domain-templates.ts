export type DomainGroup = {
  patterns: RegExp[];
  origin: string;
  referer: string;
  excludeHeaders?: string[];
  overrideHeaders?: Record<string, string>;
  additionalHeaders?: Record<string, string>;
}

export type DomainTemplate = {
  pattern: RegExp;
  origin: string;
  headers: Record<string, string>;
  referer: string;
}
