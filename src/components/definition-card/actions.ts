'use server'

import { env } from "@/lib/env/server";
import { JMdictWord } from "@scriptin/jmdict-simplified-types";

type JMdictEntriesResponse = {
  success: boolean;
  entries?: JMdictWord[]
  message?: string
}

export async function getJMdictEntries(query?: string) {
  try {
    const dataRaw = await fetch(`${env.API_URL}/indexes/jmdict/search/${query}`)

    if (!dataRaw.ok) {
      throw new Error(`API responded with status: ${dataRaw.status}`);
    }
    const { success, entries, message } = await dataRaw.json() as JMdictEntriesResponse

    if (!success) {
      throw new Error(message || 'API returned failure');
    }

    if (!entries || !entries) {
      throw new Error('Invalid entries structure returned from API');
    }

    return entries
  } catch (error) {
    throw new Error(`Failed to fetch initial anime data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}