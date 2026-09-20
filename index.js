import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import userRoutes from './routes/users.js';
import spotifyRoutes from './routes/spotify.js';

const app = express();

const PORT = process.env.PORT || 5000;

// CORS: only allow the deployed frontend and local dev
const allowedOrigins = [
	process.env.FRONTEND_URL || 'https://roastify-beta.vercel.app',
	'http://localhost:3000',
];

app.use(cors({
	origin(origin, callback) {
		// Allow requests with no origin (e.g. server-to-server, curl)
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/spotify', spotifyRoutes);

app.get('/health', (req, res) => {
	return res.json({
		status: 'UP'
	});
});

app.listen(PORT, '127.0.0.1', () => {
	console.log(
		`Roastify backend listening on http://127.0.0.1:${PORT}`
	);
});