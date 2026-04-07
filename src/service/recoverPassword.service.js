import { sendMessageEmail } from '../util/sendMessageEmail.util.js';
import { getUserByEmail } from '../repositories/users.repositories.js';
import { saveRecoveryCode, getValidCode, markCodeUsed } from '../repositories/recoverPassword.repositories.js';
import { updatePassword } from '../repositories/users.repositories.js';
import { hashPassword } from '../util/hcrypt.util.js';
import { validatePassword } from '../util/inputsValid.util.js';
import AppError from '../middleware/appError.middleware.js';

export async function requestRecovery(email) {
    const user = await getUserByEmail(email);
    if (!user) throw new AppError('E-mail não encontrado.', 404);

    const code = String(Math.floor(100000 + Math.random() * 900000));

    await saveRecoveryCode(user.id, code);

    const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;">
            <h2 style="color: #6c5ce7; margin-bottom: 8px;">Recuperação de Senha</h2>
            <p style="color: #636e72;">Seu código de verificação é:</p>
            <div style="font-size: 2.5rem; font-weight: bold; letter-spacing: 8px; color: #6c5ce7; text-align: center; padding: 24px; background: white; border-radius: 8px; margin: 16px 0;">
                ${code}
            </div>
            <p style="color: #636e72; font-size: 0.85rem;">Este código expira em <strong>15 minutos</strong>. Se não foi você, ignore este e-mail.</p>
        </div>
    `;

    await sendMessageEmail(email, 'Código de recuperação de senha', html);

    return { message: 'Código enviado para o e-mail.', userId: user.id };
}

export async function verifyCode(userId, code) {
    const valid = await getValidCode(userId, code);
    if (!valid) throw new AppError('Código inválido ou expirado.', 400);
    return { message: 'Código válido.' };
}

export async function resetPassword(userId, code, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
        throw new AppError('As senhas não coincidem.', 400);
    }

    validatePassword(newPassword);

    const valid = await getValidCode(userId, code);
    if (!valid) throw new AppError('Código inválido ou expirado.', 400);

    const hashed = await hashPassword(newPassword);
    await updatePassword(userId, hashed);
    await markCodeUsed(userId);

    return { message: 'Senha alterada com sucesso!' };
}
