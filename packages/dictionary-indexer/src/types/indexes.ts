export type Index = 'jmdict' | 'jmnedict' | 'kanjidic2' | 'nhk'

export type IndexSetupResult =  {
  success: boolean
  indexName: Index
  documentCount?: number
  error?: string
}