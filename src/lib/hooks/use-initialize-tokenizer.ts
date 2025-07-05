import { useTokenizer } from "@/lib/hooks/use-tokenizer";
import { useEffect } from "react";

export function useInitializeTokenizer() {
  const { initalize, isInitialized, isLoading } = useTokenizer()

  useEffect(() => {
    (async () => {
      await initalize()
    })()
  }, [initalize])

  return {
    isInitialized,
    isLoading
  }
}