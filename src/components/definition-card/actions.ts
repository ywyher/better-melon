'use server'

import { env } from "@/lib/env/server";
import { Index } from "@/types/dictionary";
import { JMdictWord } from "@/types/jmdict";
import { JMnedictWord } from "@/types/jmnedict";
import { Kanjidic2Character } from "@/types/kanjidic2";

export type JMdictResponse = {
  success: boolean;
  data?: {
    entries: JMdictWord[];
    isFuzzy: boolean
  }
  message?: string
}

export async function getJMdictEntries(query?: string) {
  try {
    const dataRaw = await fetch(`${env.API_URL}/indexes/jmdict/search/${query}`)

    if (!dataRaw.ok) {
      throw new Error(`API responded with status: ${dataRaw.status}`);
    }
    const { success, data, message } = await dataRaw.json() as JMdictResponse

    if (!success) {
      throw new Error(message || 'API returned failure');
    }

    if (!data || !data?.entries) {
      throw new Error('Invalid entries structure returned from API');
    }

    return {
      entries: data.entries,
      isFuzzy: data.isFuzzy
    }
  } catch (error) {
    throw new Error(`Failed to fetch jmdict entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export type DictionaryResponse = {
  success: true;
  data: [
    {
      index: 'jmdict';
      entries: JMdictWord[];
    },
    {
      index: 'jmnedict';
      entries: JMnedictWord[];
    },
    {
      index: 'kanjidic2';
      entries: Kanjidic2Character[];
    },
  ]
  message?: string;
}

export async function getDictionaryEntries(query?: string) {
  try {
    const dataRaw = await fetch(`${env.API_URL}/dictionary/search/${query}`)

    if (!dataRaw.ok) {
      throw new Error(`API responded with status: ${dataRaw.status}`);
    }
    const { success, data, message } = await dataRaw.json() as DictionaryResponse

    if (!success) {
      throw new Error(message || 'API returned failure');
    }

    if (!data || !data?.entries) {
      throw new Error('Invalid entries structure returned from API');
    }

    console.log(data)

    return data.map(result => {
      return {
        index: result.index as Index,
        entries: result.entries
      }
    });
  } catch (error) {
    throw new Error(`Failed to fetch dictionary entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}