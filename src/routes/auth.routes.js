import { Router } from 'express';
import { login, sendCode, verifyCode, register } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);
router.post('/register', register);

export default router;
