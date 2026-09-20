import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/roast', userController.getRoast);
router.get('/roast', userController.getLatestRoast);

export default router;