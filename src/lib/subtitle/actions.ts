'use server';

import { initializeTokenizer, isTokenizerInitialized } from "@/app/api/subtitles/parse/route";
import { KuromojiToken } from "kuromojin";

export async function tokenizeText(text: string): Promise<KuromojiToken[] | null> {
  try {
    const tokenizer = await initializeTokenizer('tokenize-action');
    
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

export async function checkTokenizerStatus() {
  try {
    const isInitialized = await isTokenizerInitialized();
    return {
      success: true,
      isInitialized,
      message: isInitialized ? 'Tokenizer is already initialized' : 'Tokenizer not initialized'
    };
  } catch (error) {
    console.error('Error checking tokenizer status:', error);
    return {
      success: false,
      isInitialized: false,
      error: 'Failed to check tokenizer status'
    };
  }
}

export async function initializeTokenizerAction() {
  try {
    const start = performance.now();
    const tokenizer = await initializeTokenizer('server-action');
    const end = performance.now();
    
    if(tokenizer) {
      return {
        success: true,
        isInitialized: true,
        initializationTime: end - start,
        message: 'Tokenizer initialized successfully'
      };
    } else {
      throw new Error("Failed to initalize tokenizer")
    }
  } catch (error) {
    console.error('Error initializing tokenizer:', error);
    return {
      success: false,
      isInitialized: false,
      error: 'Failed to initialize tokenizer'
    };
  }
}