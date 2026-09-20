import supabase from './db.js';

export async function findUser({ userId, username }) {
	let query = supabase.from('users').select('*');

	if (userId) {
		query = query.eq('user_id', userId);
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
		created_at: createdAt ?? new Date().toISOString(),
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