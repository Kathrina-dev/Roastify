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

export interface RoastResponse {
  roast: {
    roast_content: string;
  };
}

export interface StoryCard {
  id: string;
  type: 'cover' | 'artists' | 'tracks' | 'personality' | 'verdict';
  title: string;
  content: string;
  metadata?: any;
}
