import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMe, updateProfile } from '../controllers/authController.js';

const router = Router();

router.get('/me', authenticate, getMe);
router.post('/profile', authenticate, updateProfile);

export default router;
