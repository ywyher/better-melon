import { checkTokenizerStatus, initializeTokenizerAction, tokenizeText } from "@/lib/subtitle/actions";
import { useState } from "react";

export function useTokenizer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initializationTime, setInitializationTime] = useState<number>(0);

  const initalize = async () => {
    try {
      setIsLoading(true);
      
      const statusResult = await checkTokenizerStatus();
      
      if (!statusResult.success) {
        throw new Error(statusResult.error);
      }
      
      if (statusResult.isInitialized) {
        console.debug('Tokenizer already initialized on server');
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }
      
      console.debug('Initializing tokenizer on server...');
      const initResult = await initializeTokenizerAction();
      
      if (initResult.success) {
        console.debug(`Tokenizer initialized: ${initResult.initializationTime?.toFixed(2)}ms`);
        setIsInitialized(true);
        setInitializationTime(initResult.initializationTime || 0);
      } else {
        throw new Error(initResult.error || 'Failed to initialize tokenizer');
      }
    } catch (err) {
      console.error("Failed to initialize tokenizer:", err);
      setError(err instanceof Error ? err : new Error("Unknown error during tokenizer initialization"));
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }

  const tokenize = async (text: string) => {
    if (!isInitialized) {
      await initalize();
    }
    return await tokenizeText(text);
  }

  return {
    initalize,
    tokenize,
    isInitialized,
    isLoading,
    error,
    initializationTime
  };
}