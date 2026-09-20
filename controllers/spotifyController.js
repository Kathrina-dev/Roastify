import axios from 'axios';
import crypto from 'node:crypto';

import * as userModel from '../models/userModel.js';
import * as spotifyModel from '../models/spotifyModel.js';
import * as aiService from '../services/aiService.js';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_URL =
	process.env.FRONTEND_URL ||
	'https://roastify-beta.vercel.app';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function login(req, res) {
	const state = crypto.randomBytes(16).toString('hex');

	const params = new URLSearchParams({
		response_type: 'code',
		client_id: CLIENT_ID,
		scope: 'user-read-private user-read-email user-top-read',
		redirect_uri: REDIRECT_URI,
		state
	});

	res.redirect(
		`https://accounts.spotify.com/authorize?${params.toString()}`
	);
}

export async function callback(req, res) {
	const { code, error } = req.query;

	if (error) {
		return res.redirect(
			`${FRONTEND_URL}/roast?error=${encodeURIComponent('Spotify authorization was denied')}`
		);
	}

	if (!code) {
		return res.redirect(
			`${FRONTEND_URL}/roast?error=${encodeURIComponent('No authorization code returned by Spotify')}`
		);
	}

	try {
		// 1. Exchange authorization code for access token
		const tokenResponse = await axios.post(
			'https://accounts.spotify.com/api/token',
			new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: REDIRECT_URI
			}).toString(),
			{
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded',
					Authorization:
						'Basic ' +
						Buffer
							.from(
								`${CLIENT_ID}:${CLIENT_SECRET}`
							)
							.toString('base64')
				}
			}
		);

		const {
			access_token,
			expires_in
		} = tokenResponse.data;

		// 2. Get Spotify profile
		const profileResponse = await axios.get(
			'https://api.spotify.com/v1/me',
			{
				headers: {
					Authorization: `Bearer ${access_token}`
				}
			}
		);

		const spotifyUser = profileResponse.data;

		// 3. Find or create Roastify user
		let user = await userModel.findUser({
			username: spotifyUser.id
		});

		if (!user) {
			user = await userModel.createUser({
				username: spotifyUser.id
			});
		}

		// 4. Check latest Spotify snapshot
		const latestSnapshot =
			await spotifyModel.findLatestSnapshot({
				userId: user.user_id
			});

		const snapshotAgeMs = latestSnapshot?.fetched_at
			? Date.now() -
				new Date(
					latestSnapshot.fetched_at
				).getTime()
			: Infinity;

		const snapshotIsFresh =
			snapshotAgeMs < SEVEN_DAYS_MS;

		// 5. Reuse snapshot if it is less than 7 days old
		if (snapshotIsFresh) {
			// Check if a roast already exists for this snapshot
			let existingRoast =
				await spotifyModel.findRoastBySnapshotId({
					snapshotId: latestSnapshot.snapshot_id
				});

			if (!existingRoast) {
				// Generate and save roast
				const roastText =
					await aiService.generateRoast({
						topArtists:
							latestSnapshot.top_artists,
						topTracks:
							latestSnapshot.top_tracks
					});

				await spotifyModel.createRoastForSnapshot({
					userId: user.user_id,
					snapshotId:
						latestSnapshot.snapshot_id,
					roastContent: JSON.stringify(roastText)
				});
			}

			return res.redirect(
				`${FRONTEND_URL}/roast?userId=${encodeURIComponent(user.user_id)}`
			);
		}

		// 6. Fetch fresh Spotify data
		const [
			artistsResponse,
			tracksResponse
		] = await Promise.all([
			axios.get(
				'https://api.spotify.com/v1/me/top/artists',
				{
					params: {
						limit: 20,
						time_range: 'medium_term'
					},
					headers: {
						Authorization:
							`Bearer ${access_token}`
					}
				}
			),

			axios.get(
				'https://api.spotify.com/v1/me/top/tracks',
				{
					params: {
						limit: 20,
						time_range: 'medium_term'
					},
					headers: {
						Authorization:
							`Bearer ${access_token}`
					}
				}
			)
		]);

		// 7. Create new snapshot
		const snapshot =
			await spotifyModel.createSnapshot({
				userId: user.user_id,
				timeRange: 'medium_term',
				topArtists:
					artistsResponse.data.items,
				topTracks:
					tracksResponse.data.items
			});

		// 8. Generate and save roast for new snapshot
		const roastText =
			await aiService.generateRoast({
				topArtists:
					artistsResponse.data.items,
				topTracks:
					tracksResponse.data.items
			});

		await spotifyModel.createRoastForSnapshot({
			userId: user.user_id,
			snapshotId: snapshot.snapshot_id,
			roastContent: JSON.stringify(roastText)
		});

		// 9. Redirect to frontend with userId
		return res.redirect(
			`${FRONTEND_URL}/roast?userId=${encodeURIComponent(user.user_id)}`
		);

	} catch (err) {
		console.error(
			'Spotify authentication error:',
			err.response?.data ||
				err.message
		);

		return res.redirect(
			`${FRONTEND_URL}/roast?error=${encodeURIComponent('Something went wrong during authentication. Please try again.')}`
		);
	}
}