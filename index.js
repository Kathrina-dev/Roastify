import express from 'express';
import 'dotenv/config';

import userRoutes from './routes/users.js';
import spotifyRoutes from './routes/spotify.js';

const app = express();

const PORT = process.env.PORT || 5000;

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