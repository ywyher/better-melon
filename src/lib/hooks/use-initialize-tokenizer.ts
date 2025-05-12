import { initializeTokenizer, isTokenizerInitialized } from "@/lib/subtitle/parse";
import { Tokenizer } from "kuromojin";
import { useEffect, useRef, useState } from "react";

export function useTokenizer() {
  const [isInitialized, setIsInitialized] = useState<boolean>(isTokenizerInitialized());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [tokenizer, setTokenizer] = useState<Tokenizer | null | undefined>(null)
  const initAttemptedRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      if (!isTokenizerInitialized() && !initAttemptedRef.current) {
        try {
          setIsLoading(true);
          initAttemptedRef.current = true;
          
          const start = performance.now();
          const tokenizer = await initializeTokenizer('hook');
          const end = performance.now();
          console.debug(`~Initialize Tokenizer: ${(end - start).toFixed(2)}ms`);
          
          if (isMounted) {
            setIsInitialized(true);
            setIsLoading(false);
            setTokenizer(tokenizer)
          }
        } catch (err) {
          console.error("Failed to initialize tokenizer:", err);
          if (isMounted) {
            setError(err instanceof Error ? err : new Error("Unknown error during tokenizer initialization"));
            setIsLoading(false);
            setTokenizer(null)
          }
          initAttemptedRef.current = false;
        }
      } else if (isTokenizerInitialized() && !isInitialized && isMounted) {
        setIsInitialized(true);
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [isInitialized]);
  
  return {
    isInitialized,
    isLoading,
    error,
    tokenizer
  };
}