import { RoastResponse, StoryCard } from "./types";

const MOCK_ROAST = `Oh wow, another user whose top artist is Taylor Swift. Groundbreaking. Your music taste is the equivalent of a beige wall. You pretend to be edgy by throwing in a single Arctic Monkeys track from 2013, but we all know you cry to Olivia Rodrigo in the shower.

Your top tracks scream "I peaked in high school and I'm still trying to reclaim that feeling." It's almost sad how predictable you are. You probably think you have a diverse music taste because you listen to both pop AND indie pop. Newsflash: it's all just pop.

I would tell you to expand your horizons, but honestly, I don't think you could handle it. Stick to your safe little bubble of algorithmic recommendations. The Spotify algorithm knows you better than you know yourself, and frankly, it's disappointed.`;

export async function generateRoast(username: string): Promise<RoastResponse> {
  try {
    const res = await fetch('/api/users/roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ spotifyUsername: username }),
    });

    if (!res.ok) {
      // If the backend fails (e.g. no Spotify credentials or user not found), return mock data
      console.warn('Backend failed to generate roast, using mock data.');
      return {
        roast: {
          roast_content: MOCK_ROAST
        }
      };
    }

    return await res.json();
  } catch (err) {
    console.error('Error generating roast, using mock data:', err);
    return {
      roast: {
        roast_content: MOCK_ROAST
      }
    };
  }
}

export function parseRoastIntoCards(roastContent: string): StoryCard[] {
  // Simple paragraph splitter to simulate different story cards
  const paragraphs = roastContent.split('\n\n').filter(p => p.trim() !== '');
  
  const cards: StoryCard[] = [];
  
  cards.push({
    id: 'cover',
    type: 'cover',
    title: 'Your Music Taste is Under Investigation',
    content: 'We looked into your soul (Spotify data), and it\'s not pretty.',
  });

  if (paragraphs.length > 0) {
    cards.push({
      id: 'artists',
      type: 'artists',
      title: 'The Usual Suspects',
      content: paragraphs[0],
    });
  }

  if (paragraphs.length > 1) {
    cards.push({
      id: 'tracks',
      type: 'tracks',
      title: 'Guilty Pleasures',
      content: paragraphs[1],
    });
  }

  if (paragraphs.length > 2) {
    cards.push({
      id: 'personality',
      type: 'personality',
      title: 'Vibe Check',
      content: paragraphs.slice(2).join('\n\n'),
    });
  }

  cards.push({
    id: 'verdict',
    type: 'verdict',
    title: 'Final Verdict',
    content: '100% Basic.',
    metadata: {
      scoville: '100,000 SHU'
    }
  });

  return cards;
}
