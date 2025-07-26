import { useTokenizer } from "@/lib/hooks/use-tokenizer";
import { useEffect } from "react";

type UseInitializeTokenizerProps = {
  shouldInitialize: boolean
}

export function useInitializeTokenizer({ shouldInitialize }: UseInitializeTokenizerProps) {
  const { initalize, isInitialized, isLoading } = useTokenizer()

  useEffect(() => {
    if (!shouldInitialize) return;

    (async () => {
      await initalize()
    })()
  }, [initalize, shouldInitialize])

  return {
    isInitialized,
    isLoading
  }
}