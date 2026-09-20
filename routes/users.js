import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getUser);
router.get('/spotify', userController.getSpotify);
router.post('/roast', userController.getRoast);

export default router;