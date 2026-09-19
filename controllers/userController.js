import * as userModel from '../models/userModel.js';

function readValue(req, keys) {
	for (const key of keys) {
		const value = req.params?.[key] ?? req.query?.[key] ?? req.body?.[key];

		if (value !== undefined && value !== null && value !== '') {
			return value;
		}
	}

	return undefined;
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

		const user = userId
			? await userModel.findUser({ userId })
			: await userModel.findUser({ username });

		if (!user) {
			return res.status(404).json({
				error: 'User not found',
			});
		}

		if (roastContent) {
			const roast = await userModel.updateUserRoast({
				userId: user.userId,
				roastContent,
			});

			return res.status(200).json({
				roast,
			});
		}

		return res.status(200).json({
			message: 'Provide roastContent to update the roast',
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
}
