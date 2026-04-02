import { getUserByEmail, getUserById, createUser as createUserRepo, deleteUserById, getPermissions, createPermissions } from '../repositories/users.repositories.js';
import AppError from '../middleware/appError.middleware.js';
import { hashPassword as hashPwd, comparePassword } from '../util/hcrypt.util.js';
import { validateEmail, validatePassword } from '../util/inputsValid.util.js';
import { generateToken } from '../util/jwt.util.js';

export async function loginUser(email, password) {
    validateEmail(email);
    validatePassword(password);

    const user = await getUserByEmail(email);
    if (!user) throw new AppError('Usuário não encontrado. Você conhece a penpen ou a neném?', 404);

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new AppError('Senha incorreta. Por favor digita a senha direito pro servidor não cair caraí.', 401);

    const permissions = await getPermissions(user.id);

    const token = generateToken({
        id: user.id,
        email: user.email,
        modification: permissions?.modification || 0,
        admin: permissions?.admin || 0
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            permissions: {
                modification: permissions?.modification || 0,
                admin: permissions?.admin || 0
            }
        }
    };
}

export async function registerUser(email, password) {
    validateEmail(email);
    validatePassword(password);

    const existingUser = await getUserByEmail(email);
    if (existingUser) throw new AppError('Usuário já existe paizão. O sistema está funcionando então por favor, não tente criar um usuário com o mesmo e-mail.', 400);

    const hashedPassword = await hashPwd(password);
    const result = await createUserRepo(email, hashedPassword);
    const userId = result.insertId;

    await createPermissions(userId);

    const token = generateToken({
        id: userId,
        email,
        modification: 0,
        admin: 0
    });

    return {
        token,
        user: {
            id: userId,
            email,
            permissions: { modification: 0, admin: 0 }
        }
    };
}

export async function deleteAccount(userId) {
    const user = await getUserById(userId);
    if (!user) throw new AppError('Usuário não encontrado. Você conhece a penpen ou a neném?', 404);

    await deleteUserById(userId);
    return { message: 'Conta deletada com sucesso. Agora você pode ir pro banheiro e se lavar as mãos.' };
}

export async function getUserProfile(userId) {
    const user = await getUserById(userId);
    if (!user) throw new AppError('Usuário não encontrado. Já bebeu água hoje ou nada?', 404);

    const permissions = await getPermissions(userId);

    return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        permissions: {
            modification: permissions?.modification || 0,
            admin: permissions?.admin || 0
        }
    };
}
