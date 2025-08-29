import { useEffect, useState } from 'react';

interface GoldenEmojiProps {
  x: number;
  y: number;
  onClick: () => void;
  lifetime?: number; // in ms
}

const GoldenEmoji = ({ x, y, onClick, lifetime = 6000 }: GoldenEmojiProps) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const updateInterval = 100; // ms
        const totalUpdates = lifetime / updateInterval;
        const decrement = 100 / totalUpdates;

        const interval = setInterval(() => {
            setProgress(p => Math.max(0, p - decrement));
        }, updateInterval);

        return () => clearInterval(interval);
    }, [lifetime]);
    
    return (
        <div
            className="fixed z-50 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            <button
                onClick={onClick}
                className="relative text-5xl animate-shimmer focus:outline-none drop-shadow-lg"
                aria-label="Click the golden emoji for a bonus"
            >
                🌟
            </button>
            <div className="absolute bottom-[-10px] left-[-10px] right-[-10px] h-1.5 bg-gray-900/50 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-yellow-400 transition-all duration-100 ease-linear"
                    style={{width: `${progress}%`}}
                ></div>
            </div>
        </div>
    );
};

export default GoldenEmoji;