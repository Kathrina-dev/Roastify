import * as userModel from '../models/userModel.js';

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
	});

	await userModel.createSnapshotArtists({
		snapshotId: snapshot.snapshot_id,
		artists: topArtists,
	});

	await userModel.createSnapshotTracks({
		snapshotId: snapshot.snapshot_id,
		tracks: topTracks,
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
		const username = readValue(req, ['username', 'spotify_username', 'spotifyUsername']);
		const roastContent = readValue(req, ['roastContent']);
		const timeRange = readValue(req, ['timeRange']) ?? 'medium_term';
		const spotifyProfile = readValue(req, ['spotifyProfile']);
		const topArtists = readValue(req, ['topArtists']);
		const topTracks = readValue(req, ['topTracks']);
		const forceRefresh = Boolean(readValue(req, ['forceRefresh']));

		const user = userId
			? await userModel.findUser({ userId })
			: await userModel.findUser({ username });

		if (!user) {
			return res.status(404).json({
				error: 'User not found',
			});
		}

		const latestSnapshot = await userModel.findLatestSnapshot({
			userId: user.user_id,
		});
		const latestRoast = latestSnapshot
			? await userModel.findRoastBySnapshotId({
				snapshotId: latestSnapshot.snapshot_id,
			})
			: null;
		const latestSnapshotAgeMs = getSnapshotAgeMs(latestSnapshot);
		const canReuseLatestRoast =
			!forceRefresh &&
			latestSnapshot &&
			latestRoast &&
			latestSnapshotAgeMs < SEVEN_DAYS_MS &&
			!hasFreshSpotifyPayload(spotifyProfile, topArtists, topTracks);

		if (canReuseLatestRoast) {
			return res.status(200).json({
				reused: true,
				snapshot: latestSnapshot,
				roast: latestRoast,
			});
		}

		const needsFreshSnapshot =
			forceRefresh ||
			!latestSnapshot ||
			latestSnapshotAgeMs >= SEVEN_DAYS_MS;

		let snapshot = latestSnapshot;

		if (needsFreshSnapshot) {
			if (!hasFreshSpotifyPayload(spotifyProfile, topArtists, topTracks)) {
				return res.status(409).json({
					error: 'The latest Spotify snapshot is stale. Provide fresh Spotify data to create a new roast.',
				});
			}

			snapshot = await persistFreshSnapshot({
				userId: user.user_id,
				timeRange,
				spotifyProfile,
				topArtists,
				topTracks,
			});
		}

		if (roastContent) {
			const roast = await userModel.updateUserRoast({
				userId: user.user_id,
				roastContent,
				snapshotId: snapshot?.snapshot_id,
			});

			return res.status(200).json({
				snapshot,
				roast,
			});
		}

		return res.status(200).json({
			snapshot,
			roast: latestRoast,
			message: snapshot ? 'Snapshot is ready. Provide roastContent to save a roast for this snapshot.' : 'No snapshot was available.',
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
}
