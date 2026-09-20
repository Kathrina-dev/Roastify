"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const LOADING_MESSAGES = [
  "Pulling up your Spotify receipts...",
  "Analyzing your questionable taste...",
  "Judging your top played tracks...",
  "Crafting maximum damage roasts...",
  "Consulting the roast masters...",
  "This is gonna be brutal...",
];

export default function RoastSkeleton() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-4">
      <div className="relative flex flex-col items-center w-full max-w-sm glass-card rounded-3xl p-10 space-y-8 animate-pulse-slow">
        
        {/* Flame Spinner */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#ff4500] blur-xl opacity-50 rounded-full animate-ping"></div>
          <Flame className="w-16 h-16 text-[#ff4500] animate-bounce relative z-10" />
        </div>

        {/* Shimmer Text Lines */}
        <div className="w-full space-y-4">
          <div className="h-6 w-3/4 bg-[#3b1009] rounded overflow-hidden relative mx-auto">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#8c2916] to-transparent animate-[shimmer_1.5s_infinite]"></div>
          </div>
          <div className="h-4 w-full bg-[#1a0806] rounded overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#3b1009] to-transparent animate-[shimmer_1.5s_infinite_0.2s]"></div>
          </div>
          <div className="h-4 w-5/6 bg-[#1a0806] rounded overflow-hidden relative mx-auto">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#3b1009] to-transparent animate-[shimmer_1.5s_infinite_0.4s]"></div>
          </div>
        </div>

        {/* Dynamic Message */}
        <div className="text-center h-12 flex items-center justify-center">
          <p className="text-[#f2aa9b] font-medium animate-pulse transition-all duration-500">
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
