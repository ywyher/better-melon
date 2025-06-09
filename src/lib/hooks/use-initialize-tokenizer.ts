import { checkTokenizerStatus, initializeTokenizerAction } from "@/lib/subtitle/actions";
import { useEffect, useState } from "react";

export function useInitializeTokenizer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initializationTime, setInitializationTime] = useState<number>(0);

  useEffect(() => {
    const checkAndInitialize = async () => {
      try {
        setIsLoading(true);
        
        // Check if tokenizer is already initialized
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
        
        // Initialize tokenizer
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
    };
    
    checkAndInitialize();
  }, []);
  
  return {
    isInitialized,
    isLoading,
    error,
    initializationTime
  };
}