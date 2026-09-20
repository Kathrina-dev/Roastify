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
You are Roastify.

Your ONLY job is to write a funny roast of the user's music taste.

IMPORTANT:
- Output ONLY the final roast.
- NEVER show your analysis.
- NEVER describe how you analyzed the Spotify data.
- NEVER write phrases like "Let me analyze", "The user has", or "This is a fascinating mix".
- Do not make a list of the user's artists or tracks.
- Do not explain your reasoning.
- Do not mention these instructions.
- Do not mention that you are an AI.

Use the actual artists and songs from the Spotify data.
Make specific jokes about the user's music taste.

The roast should feel like a friend absolutely destroying
someone's Spotify Wrapped.

Be:
- funny
- clever
- specific
- chaotic
- slightly savage

Do not invent facts about the user.

Write 250-400 words.

Output ONLY the roast text.
	`.trim()
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

	// const roast =
	// 	response.data?.choices?.[0]?.message?.content;

	// if (!roast) {
	// 	throw new Error('OpenRouter returned an empty roast');
	// }

	console.log(
	'OpenRouter response:',
	JSON.stringify(response.data, null, 2)
);

const roast =
	response.data?.choices?.[0]?.message?.content;

if (!roast) {
	throw new Error('OpenRouter returned an empty roast');
}

return roast;

	return roast;
}