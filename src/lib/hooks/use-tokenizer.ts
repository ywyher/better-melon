import { useTokenizerStore } from "@/lib/stores/use-tokenizer-store";
import { initializeTokenizerThroughClient, isTokenizerInitialized, tokenizeText } from "@/lib/subtitle/tokenizer";
import { useCallback, useState } from "react";

export function useTokenizer() {
  const { isInitialized, setIsInitialized } = useTokenizerStore()
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initializationTime, setInitializationTime] = useState<number>(0);

  const initalize = useCallback(async () => {
    try {
      setIsLoading(true);

      if (isInitialized) {
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }
      const isInitializedInner = await isTokenizerInitialized();
      if (isInitializedInner) {
        console.log('~Tokenizer already initialized on server');
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }
      
      console.log('~Tokenizer Initializing on the server...');
      const { initializationTime, error } = await initializeTokenizerThroughClient();
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
  }, [isInitialized, setError, setIsInitialized, setIsLoading])

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