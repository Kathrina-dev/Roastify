import express from 'express';
import supabase from './models/db.js';
import userRoutes from './routes/users.js';


const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    try {
        return res.status(200).json({
            status:'UP',
        })

    } catch(error) {
        return res.status(500).json({
            status: 'DOWN',
            error: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})