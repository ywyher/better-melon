import ky from "ky";
import { NetworkCondition } from "@/types";
import { useEffect, useState, useRef } from "react";

export function useNetworkCondition() {
  const [networkCondition, setNetworkCondition] = useState<NetworkCondition>('good'); // Better than 'n'
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkNetworkPerformance = async () => {
      try {
        const startTime = performance.now();
        const response = await ky('/api/ping', { 
          method: 'HEAD',
          cache: 'no-store',
          timeout: 5000,
        });
        const endTime = performance.now();
        
        if (!response.ok) {
          setNetworkCondition('poor');
          return;
        }
        
        const responseTime = endTime - startTime;
        
        if (responseTime > 500) {
          console.debug(`Network condition poor: ${responseTime.toFixed(2)}ms`);
          setNetworkCondition('poor');
        } else {
          console.debug(`Network condition good: ${responseTime.toFixed(2)}ms`);
          setNetworkCondition('good');
        }
      } catch (error) {
        setNetworkCondition('poor');
        console.warn('Network quality check failed', error);
      }
    };
    
    checkNetworkPerformance();
    intervalRef.current = setInterval(checkNetworkPerformance, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return networkCondition;
}