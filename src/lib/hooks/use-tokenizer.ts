import { initializeTokenizer, initializeTokenizerForClient, isTokenizerInitialized, tokenizeText } from "@/lib/subtitle/parse.actions";
import { useCallback, useState } from "react";

export function useTokenizer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initializationTime, setInitializationTime] = useState<number>(0);

  const initalize = useCallback(async () => {
    try {
      setIsLoading(true);
      const isInitialized = await isTokenizerInitialized();
      
      if (isInitialized) {
        console.log('~Tokenizer already initialized on server');
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }
      
      console.log('~Tokenizer Initializing on the server...');
      const { initializationTime, error } = await initializeTokenizerForClient();
      if (error) throw new Error(error)
        
      console.log(`~Tokenizer initialized: ${initializationTime}ms`);
      setIsInitialized(true);
      setInitializationTime(initializationTime);
    } catch (err) {
      console.error("~Tokenizer Failed to initialize:", err);
      setError(err instanceof Error ? err : new Error("~Tokenizer Unknown error during initialization"));
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, [])

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