"use client";

import { useState } from "react";
import { Flame, Sparkles, Music, Code } from "lucide-react";
import RoastStoryViewer from "@/components/RoastStoryViewer";
import RoastSkeleton from "@/components/RoastSkeleton";
import { generateRoast, parseRoastIntoCards } from "@/lib/api";
import { StoryCard } from "@/lib/types";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);
  const [cards, setCards] = useState<StoryCard[] | null>(null);

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsRoasting(true);
    setCards(null);

    try {
      const response = await generateRoast(username);
      const generatedCards = parseRoastIntoCards(response.roast.roast_content);
      setCards(generatedCards);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRoasting(false);
    }
  };

  const handleRestart = () => {
    setCards(null);
    setUsername("");
  };

  if (isRoasting) {
    return <RoastSkeleton />;
  }

  if (cards) {
    return <RoastStoryViewer cards={cards} onRestart={handleRestart} />;
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#ff4500] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#8c2916] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float" style={{ animationDelay: '2s' }} />

      <div className="z-10 max-w-3xl w-full flex flex-col items-center text-center space-y-10">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-[#f2aa9b] font-medium border border-[#8c2916]">
          <Flame className="w-4 h-4 text-[#ff8c00]" />
          <span>Warning: not for the faint of heart.</span>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Your Music Taste is <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] to-[#f2aa9b] neon-text">
              Trash.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#fbd6d0] max-w-xl mx-auto leading-relaxed">
            Click the button below to find out and completely destroy your ego. 
          </p>
        </div>

        {/* Action Button*/}
          <button 
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
