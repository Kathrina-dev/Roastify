"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RoastStoryViewer from "@/components/RoastStoryViewer";
import RoastSkeleton from "@/components/RoastSkeleton";
import ErrorBanner from "@/components/ErrorBanner";
import { fetchRoast, parseRoastIntoCards } from "@/lib/api";
import { StoryCard } from "@/lib/types";

function RoastPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const errorParam = searchParams.get("error");

  const [cards, setCards] = useState<StoryCard[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(errorParam || "");

  useEffect(() => {
    if (errorParam) {
      setErrorMessage(errorParam);
      return;
    }

    if (!userId) {
      setErrorMessage("No user ID provided. Please try logging in again.");
      return;
    }

    let cancelled = false;

    async function loadRoast() {
      setIsLoading(true);
      try {
        const response = await fetchRoast(userId!);
        if (cancelled) return;

        const roastContent = response.roast.roast_content;
        const parsedCards = parseRoastIntoCards(roastContent, response.snapshot);
        setCards(parsedCards);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setErrorMessage(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadRoast();

    return () => {
      cancelled = true;
    };
  }, [userId, errorParam]);

  const handleRestart = () => {
    window.location.href = "/";
  };

  if (errorMessage) {
    return (
      <ErrorBanner
        message={errorMessage}
        onRetry={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  if (isLoading || !cards) {
    return <RoastSkeleton />;
  }

  return <RoastStoryViewer cards={cards} onRestart={handleRestart} />;
}

export default function RoastPage() {
  return (
    <Suspense fallback={<RoastSkeleton />}>
      <RoastPageContent />
    </Suspense>
  );
}
