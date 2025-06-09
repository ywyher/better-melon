'use server';

import { initializeTokenizer, isTokenizerInitialized } from "@/app/api/subtitles/parse/route";

export async function checkTokenizerStatus() {
  try {
    const isInitialized = isTokenizerInitialized();
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
    const data = await initializeTokenizer('server-action');
    const end = performance.now();
    
    if(data) {
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