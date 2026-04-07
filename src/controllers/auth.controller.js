import { loginUser, sendRegistrationCode, verifyRegistrationCode, completeRegistration } from '../service/user.service.js';

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function sendCode(req, res, next) {
    try {
        const { email } = req.body;
        const result = await sendRegistrationCode(email);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function verifyCode(req, res, next) {
    try {
        const { email, code } = req.body;
        const result = await verifyRegistrationCode(email, code);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function register(req, res, next) {
    try {
        const { email, code, password, confirmPassword } = req.body;
        const result = await completeRegistration(email, code, password, confirmPassword);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}
