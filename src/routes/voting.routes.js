import { Router } from 'express';
import { vote, canVote, today, result, getHistory } from '../controllers/voting.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, vote);
router.get('/can-vote', authMiddleware, canVote);
router.get('/today', authMiddleware, today);
router.get('/result', authMiddleware, result);
router.get('/history', authMiddleware, getHistory);

export default router;
