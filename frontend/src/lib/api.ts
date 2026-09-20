import { RoastContent, RoastResponse, StoryCard, Snapshot } from "./types";
import { getTopTrackArtwork, getArtistArtwork, getSpotifyImage } from "./artworkUtils";

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

export function parseRoastIntoCards(roastContentRaw: string, snapshot?: Snapshot): StoryCard[] {
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
      imageUrls: snapshot ? getTopTrackArtwork(snapshot.top_tracks, 4) : undefined,
    });
  }

  if (roast.culpritRoast) {
    const topArtistImg = snapshot?.top_artists?.[0] ? getArtistArtwork(snapshot.top_artists[0]) : null;
    const topTrackImg = snapshot?.top_tracks?.[0] ? getSpotifyImage(snapshot.top_tracks[0]) : null;
    cards.push({
      id: "culprit",
      type: "culprit",
      title: "The Usual Suspect",
      content: roast.culpritRoast,
      imageUrls: topArtistImg ? [topArtistImg] : (topTrackImg ? [topTrackImg] : undefined),
    });
  }

  if (roast.trackRoast) {
    const topTrackImg = snapshot?.top_tracks?.[0] ? getSpotifyImage(snapshot.top_tracks[0]) : null;
    cards.push({
      id: "track",
      type: "track",
      title: "Guilty Pleasures",
      content: roast.trackRoast,
      imageUrls: topTrackImg ? [topTrackImg] : undefined,
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
      imageUrls: snapshot ? getTopTrackArtwork(snapshot.top_tracks, 3) : undefined,
    });
  }

  if (roast.redFlags?.length) {
    // Red flags gets some decorative small artworks
    cards.push({
      id: "redflags",
      type: "redflags",
      title: "Red Flags 🚩",
      content: roast.redFlags.join("\n"),
      items: roast.redFlags,
      imageUrls: snapshot ? getTopTrackArtwork(snapshot.top_tracks, 3) : undefined,
    });
  }

  if (roast.finalSentence) {
    cards.push({
      id: "sentence",
      type: "sentence",
      title: "Final Sentence",
      content: roast.finalSentence,
      imageUrls: snapshot ? getTopTrackArtwork(snapshot.top_tracks, 6) : undefined,
    });
  }

  return cards;
}
