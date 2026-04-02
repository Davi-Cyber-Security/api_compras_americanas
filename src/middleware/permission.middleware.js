import { getPermissions } from '../repositories/users.repositories.js';
import AppError from './appError.middleware.js';

export async function requireModification(req, res, next) {
    try {
        const permissions = await getPermissions(req.user.id);
        if (!permissions?.modification && !permissions?.admin) {
            return next(new AppError('Sem permissão. Necessário acesso de modificação.', 403));
        }
        req.user.modification = permissions.modification;
        req.user.admin = permissions.admin;
        next();
    } catch (error) {
        next(error);
    }
}

export async function requireAdmin(req, res, next) {
    try {
        const permissions = await getPermissions(req.user.id);
        if (!permissions?.admin) {
            return next(new AppError('Sem permissão. Necessário acesso de administrador.', 403));
        }
        req.user.admin = permissions.admin;
        next();
    } catch (error) {
        next(error);
    }
}
