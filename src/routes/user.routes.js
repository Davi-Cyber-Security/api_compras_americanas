import { Router } from 'express';
import { profile, deleteUser } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', authMiddleware, profile);
router.delete('/', authMiddleware, deleteUser);

export default router;
