import { loginUser, registerUser } from '../service/user.service.js';

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function register(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await registerUser(email, password);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}
