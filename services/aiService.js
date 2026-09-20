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

export async function generateRoast({
	topArtists = [],
	topTracks = [],
}) {
	const response = await axios.post(
		OPENROUTER_API_URL,
		{
			model: OPENROUTER_MODEL,

			messages: [
				{
					role: 'system',
					content: `
You are Roastify, a brutally funny music-taste roasting AI.

Your job is to roast someone's music taste based ONLY on
the Spotify data provided.

Make the roast:
- funny
- specific
- personal
- clever
- playful
- slightly savage

Use the actual artists and songs in the data.

Do NOT invent artists, songs, genres, listening habits,
or facts that are not present in the data.

Do not make genuinely hateful, threatening, or abusive comments.

Write the roast as if you are directly talking to the user.

Keep it around 250-400 words.

Do not explain your reasoning.
Do not mention that you are an AI.
Just give the roast.
					`.trim(),
				},
				{
					role: 'user',
					content: JSON.stringify({
						topArtists,
						topTracks,
					}),
				},
			],

			temperature: 1.1,
			max_tokens: 600,
		},
		{
			headers: {
				Authorization: `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',

				'HTTP-Referer':
					'https://roastify.kathrinaelangbam.xyz',

				'X-Title': 'Roastify',
			},
		}
	);

	const roast =
		response.data?.choices?.[0]?.message?.content;

	if (!roast) {
		throw new Error('OpenRouter returned an empty roast');
	}

	return roast;
}