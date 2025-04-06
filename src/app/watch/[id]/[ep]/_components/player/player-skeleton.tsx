"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlayerSkeleton({ isLoading }: { isLoading: boolean }) {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        if (!isLoading) return;
        
        // Reset progress when loading starts
        setProgress(0);
        
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                // Slow down progress as it approaches 100%
                const increment = Math.max(1, 10 - Math.floor(prev / 10));
                const newProgress = Math.min(99, prev + increment);
                return newProgress;
            });
        }, 200);
        
        return () => clearInterval(interval);
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 z-10 w-full aspect-video bg-black bg-opacity-80 flex flex-col items-center justify-center">
            {/* Video placeholder skeleton */}
            <Skeleton className="absolute inset-0 w-full h-full" />
            
            {/* Text overlay - shown during loading */}
            <p className="text-white text-sm font-medium mb-4 z-20">Powered by better melon</p>
            
            {/* Linear loading indicator with real progress */}
            <div className="w-64 h-1.5 bg-gray-700 rounded overflow-hidden z-20">
                <div 
                    className="h-full bg-blue-500 transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}