'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Helper component for full screen centered messages
export function Indicator({ 
    message, 
    color = "", 
    type, 
    onRetry,
    onGoBack, 
    isLoading = false
  }: { 
    message: string, 
    color?: string, 
    type: 'error' | 'loading',
    onRetry?: () => void,
    onGoBack?: () => void,
    isLoading?: boolean
  }) {
    const router = useRouter();
    
    const handleGoBack = () => {
      if (onGoBack) {
        onGoBack();
      } else if (router && router.back) {
        router.back();
      } else {
        // Fallback to browser history
        window.history.back();
      }
    };
  
    return (
      <div className="absolute bg-background top-0 left-0 flex-col gap-6 z-[100] w-full h-screen flex items-center justify-center">
        <div className="flex flex-row items-center gap-3">
          {type == 'loading' && (
            <div className="flex items-center gap-2 p-1">
              <div className="relative flex items-center justify-center">
                <div 
                  className={`h-3 w-3 rounded-full bg-blue-400 animate-pulse shadow`}
                />
                  <div 
                    className={`absolute h-5 w-5 rounded-full bg-blue-500 opacity-75 animate-ping`}
                    style={{ animationDuration: '1.5s' }}
                  />
              </div>
            </div>
          )}
          {type == 'error' && (
            <p className="font-medium text-red-500">Error</p>
          )}
          <p className={`text-xl ${color}`}>{message}</p>
        </div>
        
        {type == 'error' && (
          <div className="flex flex-row gap-4">
            <Button
              variant='outline' 
              onClick={handleGoBack}
            >
              Go Back
            </Button>
            
            {onRetry && (
              <Button
                variant='secondary'
                onClick={onRetry}
                disabled={isLoading}
              >
                Retry
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }