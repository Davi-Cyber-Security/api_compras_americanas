import { getUserByEmail, getUserById, createUser as createUserRepo, deleteUserById, getPermissions, createPermissions } from '../repositories/users.repositories.js';
import { savePendingRegistration, getValidPendingCode, markPendingVerified, getVerifiedPending, deletePendingRegistration } from '../repositories/pendingRegistration.repositories.js';
import AppError from '../middleware/appError.middleware.js';
import { hashPassword as hashPwd, comparePassword } from '../util/hcrypt.util.js';
import { validateEmail, validatePassword } from '../util/inputsValid.util.js';
import { generateToken } from '../util/jwt.util.js';
import { sendMessageEmail } from '../util/sendMessageEmail.util.js';

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

export async function sendRegistrationCode(email) {
    validateEmail(email);

    const existingUser = await getUserByEmail(email);
    if (existingUser) throw new AppError('Este e-mail já está cadastrado. Faça login ou recupere sua senha.', 400);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await savePendingRegistration(email, code);

    const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;">
            <h2 style="color: #6c5ce7; margin-bottom: 8px;">Confirme seu cadastro</h2>
            <p style="color: #636e72;">Seu código de confirmação é:</p>
            <div style="font-size: 2.5rem; font-weight: bold; letter-spacing: 8px; color: #6c5ce7; text-align: center; padding: 24px; background: white; border-radius: 8px; margin: 16px 0;">
                ${code}
            </div>
            <p style="color: #636e72; font-size: 0.85rem;">Este código expira em <strong>15 minutos</strong>. Se não foi você, ignore este e-mail.</p>
        </div>
    `;

    await sendMessageEmail(email, 'Confirme seu cadastro - Sistema de Votação', html);
    return { message: 'Código enviado para o e-mail.' };
}

export async function verifyRegistrationCode(email, code) {
    validateEmail(email);

    const pending = await getValidPendingCode(email, code);
    if (!pending) throw new AppError('Código inválido ou expirado.', 400);

    await markPendingVerified(email);
    return { message: 'E-mail verificado com sucesso.' };
}

export async function completeRegistration(email, code, password, confirmPassword) {
    if (password !== confirmPassword) throw new AppError('As senhas não coincidem.', 400);

    validateEmail(email);
    validatePassword(password);

    const verified = await getVerifiedPending(email);
    if (!verified) throw new AppError('Verificação expirada. Inicie o cadastro novamente.', 400);

    const existingUser = await getUserByEmail(email);
    if (existingUser) throw new AppError('Este e-mail já está cadastrado.', 400);

    const hashedPassword = await hashPwd(password);
    const result = await createUserRepo(email, hashedPassword);
    const userId = result.insertId;

    await createPermissions(userId);
    await deletePendingRegistration(email);

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
