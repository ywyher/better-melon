import { useStreamingStore } from "@/lib/stores/streaming-store"

export default function StreamingDetails() {
  const streamingData = useStreamingStore((state) => state.streamingData)
  
  return (
    <div>
      
    </div>
  )
}