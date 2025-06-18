import React from 'react';

interface PitchLoadingIndicatorProps {
  isLoading: boolean;
  progressPercentage: number;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export default function PitchLoadingIndicator({ 
  isLoading, 
  progressPercentage, 
  error, 
  onRetry,
  className = ""
}: PitchLoadingIndicatorProps) {
  if (!isLoading && !error && progressPercentage >= 100) return null;

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-200">
          {error ? 'Error loading pitch accents' : 'Processing pitch accents...'}
        </span>
        <span className="text-xs text-gray-400">
          {error ? '' : `${progressPercentage}%`}
        </span>
      </div>
      
      {!error && (
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {error 
            ? 'Failed to load some pitch accent data. You can still use the player.'
            : isLoading 
            ? 'Loading in background. You can start watching!'
            : 'Pitch accent processing complete!'
          }
        </p>
        
        {error && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}