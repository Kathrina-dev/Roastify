import { RoastContent, RoastResponse, StoryCard } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://roastify.kathrinaelangbam.xyz";

export async function fetchRoast(userId: string): Promise<RoastResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/users/roast?userId=${encodeURIComponent(userId)}`
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to fetch roast");
  }

  return res.json();
}

export function parseRoastIntoCards(roastContentRaw: string): StoryCard[] {
  let roast: RoastContent;

  try {
    roast =
      typeof roastContentRaw === "string"
        ? JSON.parse(roastContentRaw)
        : roastContentRaw;
  } catch {
    // Fallback: treat the entire string as a verdict
    return [
      {
        id: "cover",
        type: "cover",
        title: "Your Music Taste is Under Investigation",
        content:
          "We looked into your soul (Spotify data), and it's not pretty.",
      },
      {
        id: "verdict",
        type: "verdict",
        title: "The Verdict",
        content: roastContentRaw,
      },
    ];
  }

  const cards: StoryCard[] = [];

  cards.push({
    id: "cover",
    type: "cover",
    title: "Your Music Taste is Under Investigation",
    content: "We looked into your soul (Spotify data), and it's not pretty.",
  });

  if (roast.verdict) {
    cards.push({
      id: "verdict",
      type: "verdict",
      title: "The Verdict",
      content: roast.verdict,
    });
  }

  if (roast.biggestCrime) {
    cards.push({
      id: "crime",
      type: "crime",
      title: "Biggest Crime",
      content: roast.biggestCrime,
    });
  }

  if (roast.culpritRoast) {
    cards.push({
      id: "culprit",
      type: "culprit",
      title: "The Usual Suspect",
      content: roast.culpritRoast,
    });
  }

  if (roast.trackRoast) {
    cards.push({
      id: "track",
      type: "track",
      title: "Guilty Pleasures",
      content: roast.trackRoast,
    });
  }

  if (roast.personality) {
    cards.push({
      id: "personality",
      type: "personality",
      title: "Vibe Check",
      content: roast.personality,
    });
  }

  if (roast.whiplash) {
    cards.push({
      id: "whiplash",
      type: "whiplash",
      title: "Genre Whiplash",
      content: roast.whiplash,
    });
  }

  if (roast.redFlags?.length) {
    cards.push({
      id: "redflags",
      type: "redflags",
      title: "Red Flags 🚩",
      content: roast.redFlags.join("\n"),
      items: roast.redFlags,
    });
  }

  if (roast.finalSentence) {
    cards.push({
      id: "sentence",
      type: "sentence",
      title: "Final Sentence",
      content: roast.finalSentence,
    });
  }

  return cards;
}
