import { NetworkCondition } from "@/types";
import { useEffect, useState } from "react";

export function useNetworkCondition() {
  const [networkCondition, setNetworkCondition] = useState<NetworkCondition>('n');

  useEffect(() => {
    const checkNetworkPerformance = async () => {
      try {
        const startTime = performance.now();
        const response = await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-store'
        });
        const endTime = performance.now();
        
        if (!response.ok) {
          setNetworkCondition('poor');
          return;
        }
        
        const responseTime = endTime - startTime;
        
        if (responseTime > 500) {
          console.debug(`Network condition poor: ${responseTime}`)
          setNetworkCondition('poor');
        } else {
          console.debug(`Network condition poor: ${responseTime}`)
          setNetworkCondition('good');
        }
      } catch (error) {
        setNetworkCondition('poor');
        console.warn('Network quality check failed', error);
      }
    };
    
    checkNetworkPerformance();
    const intervalId = setInterval(checkNetworkPerformance, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return networkCondition;
}