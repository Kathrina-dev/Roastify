import express from 'express';
import axios from 'axios';
import crypto from 'node:crypto';
import 'dotenv/config';

const app = express();

const PORT = process.env.PORT || 5000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error('Missing Spotify environment variables');
}

app.get('/health', (req, res) => {
    res.json({
        status: 'UP'
    });
});

app.get('/login', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: 'user-read-private user-read-email user-top-read',
        redirect_uri: REDIRECT_URI,
        state
    });

    // Temporary testing version.
    // We'll put state in a cookie/session later.
//    res.cookie?.('spotify_state', state);

    res.redirect(
        `https://accounts.spotify.com/authorize?${params.toString()}`
    );
});

app.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).json({
            error
        });
    }

    if (!code) {
        return res.status(400).json({
            error: 'No authorization code returned by Spotify'
        });
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',

                    Authorization:
                        'Basic ' +
                        Buffer
                            .from(`${CLIENT_ID}:${CLIENT_SECRET}`)
                            .toString('base64')
                }
            }
        );

        const {
            access_token,
            refresh_token,
            expires_in
        } = tokenResponse.data;

        const profileResponse = await axios.get(
            'https://api.spotify.com/v1/me',
            {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }
        );

        const artistsResponse = await axios.get(
            'https://api.spotify.com/v1/me/top/artists',
            {
                params: {
                    limit: 20,
                    time_range: 'medium_term'
                },
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }
        );

        const tracksResponse = await axios.get(
            'https://api.spotify.com/v1/me/top/tracks',
            {
                params: {
                    limit: 20,
                    time_range: 'medium_term'
                },
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }
        );

        res.json({
            message: 'Spotify authentication successful',

            profile: {
                account_id: profileResponse.data.account_id,
                display_name: profileResponse.data.display_name,
                spotify_id: profileResponse.data.id
            },

            top_artists: artistsResponse.data.items.map(
                artist => ({
                    name: artist.name,
                    genres: artist.genres
                })
            ),

            top_tracks: tracksResponse.data.items.map(
                track => ({
                    name: track.name,
                    artist: track.artists[0]?.name
                })
            ),

            expires_in,

            // DON'T actually return this in production!
            // refresh_token
        });

    } catch (error) {
        console.error(
            'Spotify authentication error:',
            error.response?.data || error.message
        );

        res.status(500).json({
            error: 'Spotify authentication failed'
        });
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(
        `Roastify backend listening on http://127.0.0.1:${PORT}`
    );
});