import { getUserProfile, deleteAccount } from '../service/user.service.js';

export async function profile(req, res, next) {
    try {
        const user = await getUserProfile(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export async function deleteUser(req, res, next) {
    try {
        const result = await deleteAccount(req.user.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
}
