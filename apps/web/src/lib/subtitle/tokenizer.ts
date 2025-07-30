'use server'

import { tokenizerStats } from "@/lib/subtitle/globals";
import { getTokenizer, KuromojiToken, Tokenizer } from "kuromojin";
import path from "path";

export async function tokenizeText(text: string): Promise<KuromojiToken[] | null> {
  try {
    const tokenizer = await initializeTokenizer('tokenizeText');
    
    if (!tokenizer) {
      throw new Error('Failed to initialize tokenizer');
    }
    
    const rawTokens = tokenizer.tokenize(text);
    
    const tokens = rawTokens
      .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
      .map(token => ({
        surface_form: token.surface_form,
        basic_form: token.basic_form,
        reading: token.reading,
        pronunciation: token.pronunciation,
        pos: token.pos,
        pos_detail_1: token.pos_detail_1,
        pos_detail_2: token.pos_detail_2,
        pos_detail_3: token.pos_detail_3,
        conjugated_type: token.conjugated_type,
        conjugated_form: token.conjugated_form,
        word_position: token.word_position,
        word_id: token.word_id,
        word_type: token.word_type
      }));
    
    return tokens
  } catch (error) {
    console.error('Error tokenizing text:', error);
    return null
  }
}

export async function initializeTokenizer(name?: string): Promise<Tokenizer> {
  let { 
    tokenizer,
    tokenizerInitPromise,
  } = tokenizerStats;
  if (tokenizer) {
    console.info(`[Tokenizer] ${name} already exists in memory`);
    return tokenizer;
  }

  if (tokenizerInitPromise) {
    console.info(`[Tokenizer] ${name} Waiting for existing tokenizer initialization`);
    return await tokenizerInitPromise;
  }

  const tokenizerStart = performance.now();
  
  tokenizerInitPromise = (async () => {
    const filePath = path.join(process.cwd(), 'public', 'dict');
    const newTokenizer = await getTokenizer({ dicPath: filePath });
    
    tokenizer = newTokenizer;
    const tokenizerEnd = performance.now();
    console.info(`[Tokenizer] ${name} Tokenizer initialization took --> ${tokenizerEnd - tokenizerStart}ms`);
    
    return newTokenizer
  })().catch(error => {
    tokenizerInitPromise = null;
    throw error;
  });

  return await tokenizerInitPromise;
}

export async function initializeTokenizerThroughClient() {
  try {
    const start = performance.now();
    const tokenizer = await initializeTokenizer('initializeTokenizer-through-client');
    const end = performance.now();
    
    if(tokenizer) {
      return {
        isInitialized: true,
        initializationTime: Number((end - start).toFixed(2)),
        message: 'Tokenizer initialized successfully'
      };
    } else {
      throw new Error("Failed to initalize tokenizer")
    }
  } catch (error) {
    console.error('Error initializing tokenizer:', error);
    return {
      isInitialized: false,
      initializationTime: 0,
      error: 'Failed to initialize tokenizer'
    };
  }
}

export async function isTokenizerInitialized() {
  return tokenizerStats.tokenizer ? true : false
}