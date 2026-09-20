"use client";

import { Flame, Code } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://roastify.kathrinaelangbam.xyz";

export default function Home() {
  const handleRoast = () => {
    window.location.href = `${API_BASE_URL}/api/spotify/login`;
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#ff4500] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#8c2916] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="z-10 max-w-3xl w-full flex flex-col items-center text-center space-y-10">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-[#f2aa9b] font-medium border border-[#8c2916]">
          <Flame className="w-4 h-4 text-[#ff8c00]" />
          <span>Warning: not for the faint of heart.</span>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Your Music Taste is <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] to-[#f2aa9b] neon-text">
              Trash.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#fbd6d0] max-w-xl mx-auto leading-relaxed">
            Click the button below to find out and completely destroy your ego.
          </p>
        </div>

        {/* Action Button */}
        <button
          id="roastify-button"
          onClick={handleRoast}
          className="w-full py-4 px-8 bg-gradient-to-r from-[#ff4500] to-[#b9371d] hover:from-[#ff8c00] hover:to-[#d85236] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,69,0,0.4)] hover:shadow-[0_0_30px_rgba(255,69,0,0.6)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
        >
          <span>Roastify Me</span>
        </button>

        {/* Footer info */}
        <div className="pt-12 flex items-center justify-center gap-6 text-[#8c2916] text-sm font-medium">
          <div className="flex items-center gap-2 hover:text-[#d85236] transition-colors cursor-pointer">
            <Code className="w-4 h-4" />
            <span>Open Source</span>
          </div>
          <span>&bull;</span>
          <span>We don&apos;t store your tears.</span>
        </div>
      </div>
    </main>
  );
}
