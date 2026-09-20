import * as userModel from '../models/userModel.js';
import * as spotifyModel from '../models/spotifyModel.js';
import * as aiService from '../services/aiService.js';

function readValue(req, keys) {
	for (const key of keys) {
		const value =
			req.params?.[key] ??
			req.query?.[key] ??
			req.body?.[key];

		if (
			value !== undefined &&
			value !== null &&
			value !== ''
		) {
			return value;
		}
	}

	return undefined;
}

export async function getUser(req, res) {
	try {
		const username = readValue(req, [
			'username',
			'spotify_username',
			'spotifyUsername'
		]);

		if (!username) {
			return res.status(400).json({
				error: 'Provide spotify_username'
			});
		}

		const existingUser =
			await userModel.findUser({
				username
			});

		if (existingUser) {
			return res.status(200).json({
				created: false,
				user: existingUser
			});
		}

		const user =
			await userModel.createUser({
				username
			});

		return res.status(200).json({
			created: true,
			user
		});

	} catch (error) {
		return res.status(500).json({
			error: error.message
		});
	}
}

export async function getSpotify(req, res) {
	try {
		const spotifyUsername = readValue(req, [
			'spotifyUsername',
			'spotify_username',
			'username'
		]);

		if (!spotifyUsername) {
			return res.status(400).json({
				error: 'Provide spotify_username'
			});
		}

		const spotify =
			await spotifyModel.findSpotify({
				spotifyUsername
			});

		if (!spotify) {
			return res.status(404).json({
				error: 'Spotify account not found'
			});
		}

		return res.status(200).json({
			spotify
		});

	} catch (error) {
		return res.status(500).json({
			error: error.message
		});
	}
}

export async function getRoast(req, res) {
	try {
		const userId =
			readValue(req, ['userId']);

		const username =
			readValue(req, [
				'username',
				'spotify_username',
				'spotifyUsername'
			]);

		// Find user
		const user = userId
			? await userModel.findUser({ userId })
			: await userModel.findUser({ username });

		if (!user) {
			return res.status(404).json({
				error: 'User not found'
			});
		}

		// Find latest Spotify snapshot
		const snapshot =
			await spotifyModel.findLatestSnapshot({
				userId: user.user_id
			});

		if (!snapshot) {
			return res.status(404).json({
				error: 'No Spotify snapshot found'
			});
		}

		// Generate roast from snapshot
		const roastText =
			await aiService.generateRoast({
				topArtists:
					snapshot.top_artists,
				topTracks:
					snapshot.top_tracks
			});

		// Save roast
		const roast =
			await spotifyModel.createRoastForSnapshot({
				userId: user.user_id,
				snapshotId:
					snapshot.snapshot_id,
				roastContent: roastText
			});

		return res.status(200).json({
			roast
		});

	} catch (error) {
		console.error(
			'Roast generation error:',
			error.response?.data ||
				error.message
		);

		return res.status(500).json({
			error: 'Failed to generate roast',
			details:
				error.response?.data?.error?.message ||
				error.message
		});
	}
}