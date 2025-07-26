import React from 'react';

export function ImageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-secondary rounded-sm animate-pulse ${className}`}
      style={{ position: 'absolute', inset: 0 }}
    >
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-secondary to-transparent shine-effect"></div>
      </div>
      <style jsx>{`
        .shine-effect {
          animation: shine 1.5s infinite linear;
          background-size: 200% 100%;
        }
        
        @keyframes shine {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
    </div>
  );
}