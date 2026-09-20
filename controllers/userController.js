import * as userModel from '../models/userModel.js';
import * as aiService from '../services/aiService.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function readValue(req, keys) {
	for (const key of keys) {
		const value = req.params?.[key] ?? req.query?.[key] ?? req.body?.[key];

		if (value !== undefined && value !== null && value !== '') {
			return value;
		}
	}

	return undefined;
}

function getSnapshotAgeMs(snapshot) {
	if (!snapshot?.fetched_at) {
		return Number.POSITIVE_INFINITY;
	}

	return Date.now() - new Date(snapshot.fetched_at).getTime();
}

function hasFreshSpotifyPayload(spotifyProfile, topArtists, topTracks) {
	return Boolean(spotifyProfile?.id)
		|| (Array.isArray(topArtists) && topArtists.length > 0)
		|| (Array.isArray(topTracks) && topTracks.length > 0);
}

async function persistFreshSnapshot({
	userId,
	timeRange,
	spotifyProfile,
	topArtists,
	topTracks,
}) {
	if (spotifyProfile?.id) {
		await userModel.upsertSpotifyAccount({
			userId,
			spotifyUserId: spotifyProfile.id,
			accountId: spotifyProfile.account_id ?? spotifyProfile.id,
			displayName: spotifyProfile.display_name ?? null,
			spotifyProfile,
		});
	}

	const snapshot = await userModel.createSnapshot({
		userId,
		timeRange,
		topArtists,
		topTracks,
	});

	return snapshot;
}

export async function getUser(req, res) {
	try {
		const username = readValue(req, ['username', 'spotify_username', 'spotifyUsername']);

		if (!username) {
			return res.status(400).json({
				error: 'Provide spotify_username',
		});
		}

		const existingUser = await userModel.findUser({ username });

		if (existingUser) {
			return res.status(200).json({
				created: false,
				user: existingUser,
			});
		}

		const user = await userModel.createUser({ username });

		return res.status(200).json({
			created: true,
			user,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
}

export async function getSpotify(req, res) {
	try {
		const spotifyUsername = readValue(req, ['spotifyUsername', 'spotify_username', 'username']);

		if (!spotifyUsername) {
			return res.status(400).json({
				error: 'Provide spotify_username',
			});
		}

		const spotify = await userModel.findSpotify({ spotifyUsername });

		if (!spotify) {
			return res.status(404).json({
				error: 'Spotify account not found',
			});
		}

		return res.status(200).json({
			spotify,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
}

export async function getRoast(req, res) {
	try {
		const userId = readValue(req, ['userId']);
		const username = readValue(req, [
			'username',
			'spotify_username',
			'spotifyUsername'
		]);

		const timeRange =
			readValue(req, ['timeRange']) ?? 'medium_term';

		const spotifyProfile =
			readValue(req, ['spotifyProfile']);

		const topArtists =
			readValue(req, ['topArtists']);

		const topTracks =
			readValue(req, ['topTracks']);

		const forceRefresh =
			readValue(req, ['forceRefresh']) === true ||
			readValue(req, ['forceRefresh']) === 'true';

		const user = userId
			? await userModel.findUser({ userId })
			: await userModel.findUser({ username });

		if (!user) {
			return res.status(404).json({
				error: 'User not found',
			});
		}

		const latestSnapshot =
			await userModel.findLatestSnapshot({
				userId: user.user_id,
			});

		const latestSnapshotAgeMs =
			getSnapshotAgeMs(latestSnapshot);

		const snapshotIsFresh =
			latestSnapshot &&
			latestSnapshotAgeMs < SEVEN_DAYS_MS;

		if (snapshotIsFresh && !forceRefresh) {
			const existingRoast =
				await userModel.findRoastBySnapshotId({
					snapshotId: latestSnapshot.snapshot_id,
				});

			if (existingRoast) {
				return res.status(200).json({
					reused: true,
					snapshot: latestSnapshot,
					roast: existingRoast,
				});
			}
		}

		let snapshot = latestSnapshot;

		if (
			!snapshot ||
			!snapshotIsFresh ||
			forceRefresh
		) {
			// We need fresh Spotify data.
			if (
				!Array.isArray(topArtists) ||
				!Array.isArray(topTracks)
			) {
				return res.status(409).json({
					error:
						'Fresh Spotify data is required to create a new roast.',
				});
			}

			snapshot =
				await persistFreshSnapshot({
					userId: user.user_id,
					timeRange,
					spotifyProfile,
					topArtists,
					topTracks,
				});
		}

		const roastText =
			await aiService.generateRoast({
				topArtists: snapshot.top_artists,
				topTracks: snapshot.top_tracks,
			});

		const roast =
			await userModel.upsertRoastForSnapshot({
				userId: user.user_id,
				snapshotId: snapshot.snapshot_id,
				roastContent: roastText,
			});

		return res.status(200).json({
			reused: false,
			snapshot,
			roast,
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
				error.message,
		});
	}
}