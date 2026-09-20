import supabase from './db.js';

export async function findSpotify({ spotifyUsername }) {
	let query = supabase.from('spotify_accounts').select('*');

	if (spotifyUsername) {
		query = query.or(
			`spotify_user_id.eq.${spotifyUsername},display_name.eq.${spotifyUsername},account_id.eq.${spotifyUsername}`
		);
	}

	const { data, error } = await query.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function findLatestSnapshot({ userId }) {
	const { data, error } = await supabase
		.from('spotify_snapshots')
		.select('*')
		.eq('user_id', userId)
		.order('fetched_at', { ascending: false })
		.limit(1);

	if (error) {
		throw new Error(error.message);
	}

	return data?.[0] ?? null;
}

export async function createSnapshot({
	userId,
	timeRange,
	topArtists = [],
	topTracks = [],
	fetchedAt,
}) {
	const payload = {
		user_id: userId,
		time_range: timeRange,
		top_artists: topArtists,
		top_tracks: topTracks,
		fetched_at: fetchedAt ?? new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from('spotify_snapshots')
		.insert([payload])
		.select()
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function findRoastBySnapshotId({ snapshotId }) {
	const { data, error } = await supabase
		.from('roasts')
		.select('*')
		.eq('snapshot_id', snapshotId)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function findLatestRoast({ userId }) {
	const { data, error } = await supabase
		.from('roasts')
		.select('*')
		.eq('user_id', userId)
		.order('updated_at', { ascending: false })
		.limit(1);

	if (error) {
		throw new Error(error.message);
	}

	return data?.[0] ?? null;
}

export async function upsertRoastForSnapshot({ userId, snapshotId, roastContent }) {
	const payload = {
		user_id: userId,
		snapshot_id: snapshotId,
		roast_content: roastContent,
		updated_at: new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from('roasts')
		.upsert([payload], { onConflict: 'snapshot_id' })
		.select()
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function findRoast({ userId }) {
	return findLatestRoast({ userId });
}

export async function updateUserRoast({ userId, roastContent, snapshotId }) {
	if (snapshotId) {
		return upsertRoastForSnapshot({ userId, snapshotId, roastContent });
	}

	const latestSnapshot = await findLatestSnapshot({ userId });

	if (!latestSnapshot) {
		throw new Error('No Spotify snapshot exists for this user');
	}

	return upsertRoastForSnapshot({
		userId,
		snapshotId: latestSnapshot.snapshot_id,
		roastContent,
	});
}
