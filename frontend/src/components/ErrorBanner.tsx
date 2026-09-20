"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-4">
      <div className="relative flex flex-col items-center w-full max-w-md glass-card rounded-3xl p-10 space-y-8">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#ff4500] blur-xl opacity-30 rounded-full" />
          <div className="relative z-10 p-4 rounded-full bg-black/30 backdrop-blur-sm border border-[#ff4500]/30">
            <AlertTriangle className="w-12 h-12 text-[#ff4500]" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-[#f2aa9b] tracking-wide uppercase">
            Something Went Wrong
          </h2>
          <p className="text-[#fbd6d0] text-lg leading-relaxed">{message}</p>
        </div>

        {/* Retry */}
        {onRetry && (
          <button
            id="error-retry-button"
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff4500] to-[#b9371d] hover:from-[#ff8c00] hover:to-[#d85236] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:shadow-[0_0_30px_rgba(255,69,0,0.5)] transition-all transform hover:-translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
