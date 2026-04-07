import { Router } from 'express';
import { sendCode, validateCode, changePassword } from '../controllers/recoverPassword.controller.js';

const router = Router();

router.post('/send-code', sendCode);
router.post('/verify-code', validateCode);
router.post('/reset', changePassword);

export default router;
