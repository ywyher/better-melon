// Helper component for full screen centered messages
export function Indicator({ message, color, type }: { message: string, color: string, type: 'error' | 'loading' }) {
    return (
        <div className="absolute bg-background top-0 left-0 flex-row gap-3 z-[100] w-full h-screen flex items-center justify-center">
            {type == 'loading' && (
                <div className="h-4 w-4 rounded-full bg-blue-400 animate-pulse" />
            )}
            {type == 'error' && (
                <p className="font-medium">Error</p>
            )}
            <p className={`text-xl ${color}`}>{message}</p>
        </div>
    );
}