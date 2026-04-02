import { verifyToken } from '../util/jwt.util.js';
import AppError from './appError.middleware.js';

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Token não fornecido.', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expirado. Faça login novamente.', 401));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Token inválido.', 401));
        }
        next(error);
    }
}
