import supabase from './db.js';

export async function findUser({ userId, username }) {
	let query = supabase.from('users').select('*');

	if (userId) {
		query = query.eq('userId', userId);
	} else if (username) {
		query = query.eq('username', username);
	}

	const { data, error } = await query.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function createUser({ username, createdAt }) {
	const payload = {
		username,
		createdAt: createdAt ?? new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from('users')
		.insert([payload])
		.select()
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function findSpotify({ spotifyUsername }) {
	const { data, error } = await supabase
		.from('spotify')
		.select('*')
		.eq('spotifyUsername', spotifyUsername)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function findRoast({ userId }) {
	const { data, error } = await supabase
		.from('roast')
		.select('*')
		.eq('userId', userId)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function updateUserRoast({ userId, roastContent }) {
	const now = new Date().toISOString();
	const { data, error } = await supabase
		.from('roast')
		.upsert(
			[
				{
					userId,
					roastContent,
					createdAt: now,
					updatedAt: now,
				},
			],
			{ onConflict: 'userId' },
		)
		.select()
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}
