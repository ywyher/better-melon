import { initializeTokenizer, isTokenizerInitialized } from "@/lib/subtitle/parse";
import { Tokenizer } from "kuromojin";
import { useEffect, useRef, useState } from "react";

export function useInitializeTokenizer() {
  const [isInitialized, setIsInitialized] = useState<boolean>(isTokenizerInitialized());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [tokenizer, setTokenizer] = useState<Tokenizer | null | undefined>(null)

  useEffect(() => {
    const initialize = async () => {
      if (!isTokenizerInitialized()) {
        try {
          setIsLoading(true);
          
          const start = performance.now();
          const tokenizer = await initializeTokenizer('hook');
          const end = performance.now();
          console.debug(`~Initialize Tokenizer: ${(end - start).toFixed(2)}ms`);
          setIsInitialized(true);
          setIsLoading(false);
          setTokenizer(tokenizer)
        } catch (err) {
          console.error("Failed to initialize tokenizer:", err);
          setError(err instanceof Error ? err : new Error("Unknown error during tokenizer initialization"));
          setIsLoading(false);
          setTokenizer(null)
        }
      } else if (isTokenizerInitialized() && !isInitialized) {
        setIsInitialized(true);
      }
    };
    
    initialize();
  }, [isInitialized]);
  
  return {
    isInitialized,
    isLoading,
    error,
    tokenizer
  };
}