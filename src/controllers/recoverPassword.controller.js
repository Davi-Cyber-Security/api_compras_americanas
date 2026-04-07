import { requestRecovery, verifyCode, resetPassword } from '../service/recoverPassword.service.js';

export async function sendCode(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) return next(new (await import('../middleware/appError.middleware.js')).default('E-mail é obrigatório.', 400));
        const result = await requestRecovery(email);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function validateCode(req, res, next) {
    try {
        const { userId, code } = req.body;
        const result = await verifyCode(userId, code);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function changePassword(req, res, next) {
    try {
        const { userId, code, newPassword, confirmPassword } = req.body;
        const result = await resetPassword(userId, code, newPassword, confirmPassword);
        res.json(result);
    } catch (error) {
        next(error);
    }
}
