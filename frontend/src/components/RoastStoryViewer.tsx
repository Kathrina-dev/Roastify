"use client";

import { useState, useEffect, useCallback } from "react";
import { StoryCard as StoryCardType } from "@/lib/types";
import RoastCard from "./RoastCard";
import { ChevronLeft, ChevronRight, Share2, RotateCcw, Copy } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface RoastStoryViewerProps {
  cards: StoryCardType[];
  onRestart: () => void;
}

const SLIDE_DURATION = 8000; // 8 seconds per slide

export default function RoastStoryViewer({ cards, onRestart }: RoastStoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    }
  }, [currentIndex, cards.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') setIsPaused(p => !p); // Space to pause
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Handle auto-advance progress
  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update every 50ms
    const step = (interval / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < cards.length - 1) {
            nextSlide();
          }
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, cards.length, isPaused, nextSlide]);

  const handleCopy = () => {
    const text = cards.map(c => c.content).join('\n\n');
    navigator.clipboard.writeText(`🔥 My Spotify Roast 🔥\n\n${text}\n\nGet roasted at Roastify!`);
    alert("Roast copied to clipboard!"); // Replace with toast later
  };

  return (
    <div 
      className="fixed inset-0 bg-[#0a0302] flex flex-col items-center justify-center p-4 md:p-8"
      onPointerDown={() => setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div className="w-full max-w-md h-full max-h-[850px] relative flex flex-col">
        
        {/* Progress Bars (Instagram Style) */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-2">
          {cards.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white story-progress-fill"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Controls */}
        <div className="absolute top-8 left-4 right-4 z-50 flex justify-between items-center text-white/80">
          <span className="text-xs font-bold uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            Roastify
          </span>
          <div className="flex gap-3">
            <button onClick={handleCopy} className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-md" title="Copy Roast">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={onRestart} className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-md" title="Restart">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Touch zones for mobile tap navigation */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer" onClick={(e) => { e.stopPropagation(); prevSlide(); }} />
        <div className="absolute inset-y-0 right-0 w-2/3 z-40 cursor-pointer" onClick={(e) => { e.stopPropagation(); nextSlide(); }} />

        {/* Cards Display */}
        <div className="flex-1 relative w-full h-full perspective-1000">
          <AnimatePresence mode="wait">
            <div key={currentIndex} className="absolute inset-0">
              <RoastCard card={cards[currentIndex]} />
            </div>
          </AnimatePresence>
        </div>

        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex absolute top-1/2 -left-16 -translate-y-1/2 z-50">
          <button 
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-black/50 text-white hover:bg-[#ff4500] disabled:opacity-30 disabled:hover:bg-black/50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        
        <div className="hidden md:flex absolute top-1/2 -right-16 -translate-y-1/2 z-50">
          <button 
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            disabled={currentIndex === cards.length - 1}
            className="p-3 rounded-full bg-black/50 text-white hover:bg-[#ff4500] disabled:opacity-30 disabled:hover:bg-black/50 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
}
