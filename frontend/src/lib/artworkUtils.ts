import { Artist, Track } from "./types";

/**
 * Safely extracts the highest quality image URL from a Spotify artist or track object.
 */
export function getSpotifyImage(item: any): string | null {
  if (!item) return null;
  
  // Track objects have album.images, Artist objects have images directly
  const images = item.album?.images ?? item.images;
  
  if (images && Array.isArray(images) && images.length > 0) {
    // Spotify usually returns images sorted by size descending (largest first)
    return images[0].url;
  }
  
  return null;
}

/**
 * Gets a collection of unique album artworks from the top tracks.
 */
export function getTopTrackArtwork(topTracks: Track[], limit: number = 4): string[] {
  if (!topTracks || !Array.isArray(topTracks)) return [];
  
  const urls: string[] = [];
  for (const track of topTracks) {
    const img = getSpotifyImage(track);
    if (img && !urls.includes(img)) { // ensure uniqueness
      urls.push(img);
    }
    if (urls.length >= limit) break;
  }
  
  return urls;
}

/**
 * Gets the artwork for a specific artist.
 */
export function getArtistArtwork(artist: Artist | undefined): string | null {
  return getSpotifyImage(artist);
}
