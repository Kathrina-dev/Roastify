"use client";

import { StoryCard } from "@/lib/types";
import {
  AlertTriangle,
  Flame,
  Gavel,
  Info,
  Music,
  Skull,
  TrendingDown,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

interface RoastCardProps {
  card: StoryCard;
}

export default function RoastCard({ card }: RoastCardProps) {
  // Determine styles and icons based on card type
  const getCardTheme = () => {
    switch (card.type) {
      case "cover":
        return {
          bg: "from-[#1a0806] to-[#3b1009]",
          icon: (
            <Flame className="w-12 h-12 text-[#ff4500] animate-pulse" />
          ),
          titleColor: "text-[#f2aa9b]",
          accent: "border-[#ff4500]",
        };
      case "verdict":
        return {
          bg: "from-[#8c2916] to-[#ff4500]",
          icon: <Gavel className="w-12 h-12 text-white animate-bounce" />,
          titleColor: "text-white drop-shadow-md",
          accent: "border-white",
        };
      case "crime":
        return {
          bg: "from-[#3b1009] to-[#621c10]",
          icon: <Skull className="w-10 h-10 text-[#e87c65]" />,
          titleColor: "text-[#fbd6d0]",
          accent: "border-[#e87c65]",
        };
      case "culprit":
        return {
          bg: "from-[#0a0302] to-[#3b1009]",
          icon: <AlertTriangle className="w-10 h-10 text-[#ff8c00]" />,
          titleColor: "text-[#f2aa9b]",
          accent: "border-[#ff8c00]",
        };
      case "track":
        return {
          bg: "from-[#0a0302] to-[#1a0806]",
          icon: <Music className="w-10 h-10 text-[#d85236]" />,
          titleColor: "text-[#f2aa9b]",
          accent: "border-[#d85236]",
        };
      case "personality":
        return {
          bg: "from-[#1a0806] to-[#621c10]",
          icon: <Info className="w-10 h-10 text-[#f2aa9b]" />,
          titleColor: "text-white",
          accent: "border-[#f2aa9b]",
        };
      case "whiplash":
        return {
          bg: "from-[#621c10] to-[#3b1009]",
          icon: <TrendingDown className="w-10 h-10 text-[#e87c65]" />,
          titleColor: "text-[#fbd6d0]",
          accent: "border-[#e87c65]",
        };
      case "redflags":
        return {
          bg: "from-[#3b1009] to-[#1a0806]",
          icon: <Flame className="w-10 h-10 text-[#ff4500]" />,
          titleColor: "text-[#f2aa9b]",
          accent: "border-[#ff4500]",
        };
      case "sentence":
        return {
          bg: "from-[#8c2916] to-[#ff4500]",
          icon: <Zap className="w-16 h-16 text-white animate-bounce" />,
          titleColor: "text-white drop-shadow-md",
          accent: "border-white",
          textClass:
            "text-white text-3xl font-black italic tracking-wider uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
        };
      default:
        return {
          bg: "from-[#1a0806] to-[#3b1009]",
          icon: <Flame className="w-10 h-10 text-[#ff4500]" />,
          titleColor: "text-[#f2aa9b]",
          accent: "border-[#ff4500]",
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
          <h2
            className={clsx(
              "text-2xl md:text-3xl font-bold uppercase tracking-widest",
              theme.titleColor
            )}
          >
            {card.title}
          </h2>

          {/* Red flags: render as a list */}
          {card.type === "redflags" && card.items ? (
            <ul className="space-y-4 text-left">
              {card.items.map((flag, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-lg md:text-xl text-[#fef2ef] font-medium"
                >
                  <span className="text-[#ff4500] text-2xl leading-none shrink-0">
                    🚩
                  </span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className={clsx(
                "text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium",
                card.type === "sentence"
                  ? theme.textClass
                  : "text-[#fef2ef]"
              )}
            >
              {card.content}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
