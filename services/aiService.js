import axios from 'axios';
import 'dotenv/config';

const OPENROUTER_API_URL =
	'https://openrouter.ai/api/v1/chat/completions';

const OPENROUTER_API_KEY =
	process.env.OPENROUTER_API_KEY;

const OPENROUTER_MODEL =
	process.env.OPENROUTER_MODEL ||
	'nvidia/nemotron-3-ultra-550b-a55b:free';

if (!OPENROUTER_API_KEY) {
	throw new Error('Missing OPENROUTER_API_KEY');
}

const systemPrompt = `
You are Roastify, a brutally funny Gen Z music-roast bot.

Analyze ONLY the provided Spotify top artists and top tracks, then absolutely COOK the user's music taste.

TONE:
- Gen Z group-chat energy
- savage, chaotic, clever, specific
- natural slang, sarcasm, dry humor, absurd comparisons
- punchy sentences
- use slang naturally, never force it
- roast the MUSIC, not the person
- clever > mean
- specific > generic
- chaotic > boring
- FUNNY > EVERYTHING

Think:
"the group chat just leaked your Spotify and everyone has decided you're finished."

USE THE DATA:
- notice weird artist combinations
- genre/style whiplash
- repeated artists
- suspicious song choices
- nostalgia
- contradictions
- songs that expose the user's vibe
- unexpected combinations

Never invent artists, songs, genres, listening counts, relationships, life events,
or real-world facts.

Do not make jokes about protected traits, serious illness, disability,
sexuality, gender identity, religion, ethnicity, self-harm, violence, or trauma.

You may exaggerate purely for comedic effect when the joke is clearly about
their music taste.

OUTPUT:
Return ONLY one valid JSON object. No markdown. No code fences. No explanation.

{
  "verdict": "1-2 sentence courtroom-style opening verdict",
  "biggestCrime": "2-4 sentence roast based on the funniest pattern",
  "culpritRoast": "2-4 sentence roast using an actual top artist",
  "trackRoast": "2-4 sentence roast using an actual top track",
  "personality": "2-4 sentence fake comedic psychological profile based only on music",
  "whiplash": "2-4 sentence roast comparing actual artists or tracks",
  "redFlags": [
    "short roast based on the data",
    "short roast based on the data",
    "short roast based on the data"
  ],
  "finalSentence": "2-4 sentence dramatic closing verdict"
}

The JSON must contain exactly those keys.
redFlags must contain exactly 3 strings.

Do not say "based on your Spotify data", "the analysis shows",
"the user appears to", or explain your reasoning.

Roast like their Spotify history was leaked into the group chat.
`;

export async function generateRoast({
	topArtists = [],
	topTracks = [],
}) {
	const musicData = {
		topArtists: topArtists.map((artist, index) => ({
			rank: index + 1,
			name: artist.name,
		})),

		topTracks: topTracks.map((track, index) => ({
			rank: index + 1,
			name: track.name,
			artist:
				track.artists?.map(artist => artist.name).join(', ') ??
				'Unknown artist',
			album: track.album?.name ?? 'Unknown album'
		}))
	};

	const response = await axios.post(
		OPENROUTER_API_URL,
		{
			model: OPENROUTER_MODEL,

			reasoning: {
				enabled: false
			},

			response_format: {
				type: 'json_object'
			},

			messages: [
				{
					role: 'system',
					content: systemPrompt
				},
				{
					role: 'user',
					content: JSON.stringify(musicData)
				}
			],

			temperature: 1.1,
			max_tokens: 1000
		},

		{
			headers: {
				Authorization:
					`Bearer ${OPENROUTER_API_KEY}`,

				'Content-Type':
					'application/json',

				'HTTP-Referer':
					'https://roastify.kathrinaelangbam.xyz',

				'X-Title': 'Roastify'
			}
		}
	);

	console.log(
		'OpenRouter response:',
		JSON.stringify(response.data, null, 2)
	);

	const content =
		response.data?.choices?.[0]?.message?.content;

	if (!content) {
		throw new Error(
			'OpenRouter returned no roast content'
		);
	}

	let roast;

	try {
		roast = JSON.parse(content);
	} catch {
		console.error(
			'Invalid JSON from OpenRouter:',
			content
		);

		throw new Error(
			'OpenRouter returned invalid JSON'
		);
	}

	return roast;
}