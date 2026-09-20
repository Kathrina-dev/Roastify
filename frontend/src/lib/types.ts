export interface SpotifyUser {
  id: string;
  display_name: string;
  images?: { url: string }[];
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
}

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
}

export interface Snapshot {
  snapshot_id: string;
  top_artists: Artist[];
  top_tracks: Track[];
}

export interface RoastContent {
  verdict: string;
  biggestCrime: string;
  culpritRoast: string;
  trackRoast: string;
  personality: string;
  whiplash: string;
  redFlags: [string, string, string];
  finalSentence: string;
}

export interface RoastResponse {
  roast: {
    roast_content: string;
  };
  snapshot?: Snapshot;
}

export interface StoryCard {
  id: string;
  type:
    | "cover"
    | "verdict"
    | "crime"
    | "culprit"
    | "track"
    | "personality"
    | "whiplash"
    | "redflags"
    | "sentence";
  title: string;
  content: string;
  items?: string[];
  imageUrls?: string[];
  metadata?: Record<string, string>;
}
