"use client";

import { StoryCard } from "@/lib/types";
import { Flame, Info, Skull, TrendingDown, Zap } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

interface RoastCardProps {
  card: StoryCard;
}

export default function RoastCard({ card }: RoastCardProps) {
  // Determine styles and icons based on card type
  const getCardTheme = () => {
    switch (card.type) {
      case 'cover':
        return {
          bg: 'from-[#1a0806] to-[#3b1009]',
          icon: <Flame className="w-12 h-12 text-[#ff4500] animate-pulse" />,
          titleColor: 'text-[#f2aa9b]',
          accent: 'border-[#ff4500]'
        };
      case 'artists':
        return {
          bg: 'from-[#3b1009] to-[#621c10]',
          icon: <Skull className="w-10 h-10 text-[#e87c65]" />,
          titleColor: 'text-[#fbd6d0]',
          accent: 'border-[#e87c65]'
        };
      case 'tracks':
        return {
          bg: 'from-[#0a0302] to-[#1a0806]',
          icon: <TrendingDown className="w-10 h-10 text-[#d85236]" />,
          titleColor: 'text-[#f2aa9b]',
          accent: 'border-[#d85236]'
        };
      case 'personality':
        return {
          bg: 'from-[#1a0806] to-[#621c10]',
          icon: <Info className="w-10 h-10 text-[#f2aa9b]" />,
          titleColor: 'text-white',
          accent: 'border-[#f2aa9b]'
        };
      case 'verdict':
        return {
          bg: 'from-[#8c2916] to-[#ff4500]',
          icon: <Zap className="w-16 h-16 text-white animate-bounce" />,
          titleColor: 'text-white drop-shadow-md',
          accent: 'border-white',
          textClass: 'text-white text-3xl font-black italic tracking-wider uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
        };
      default:
        return {
          bg: 'from-[#1a0806] to-[#3b1009]',
          icon: <Flame className="w-10 h-10 text-[#ff4500]" />,
          titleColor: 'text-[#f2aa9b]',
          accent: 'border-[#ff4500]'
        };
    }
  };

  const theme = getCardTheme();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={clsx(
        "w-full h-full rounded-2xl md:rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden border-2",
        "bg-gradient-to-br",
        theme.bg,
        theme.accent,
        "shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      )}
    >
      {/* Decorative noise/texture overlay could go here */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none mix-blend-overlay"></div>

      <div className="z-10 flex flex-col items-center max-w-md w-full space-y-8">
        <div className="p-4 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 shadow-xl">
          {theme.icon}
        </div>
        
        <div className="space-y-6">
          <h2 className={clsx("text-2xl md:text-3xl font-bold uppercase tracking-widest", theme.titleColor)}>
            {card.title}
          </h2>
          
          <p className={clsx("text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium", card.type === 'verdict' ? theme.textClass : "text-[#fef2ef]")}>
            {card.content}
          </p>

          {card.metadata?.scoville && (
            <div className="mt-8 inline-block bg-black/40 px-6 py-3 rounded-full border border-[#ff4500] neon-border">
              <span className="text-[#ff8c00] font-bold text-sm tracking-widest uppercase">
                Spice Level: {card.metadata.scoville}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
