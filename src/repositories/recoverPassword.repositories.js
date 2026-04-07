import { queryDB } from '../connection/index.js';

export async function saveRecoveryCode(userId, code) {
    await queryDB({
        query: `DELETE FROM recovery_codes WHERE user_id = ?`,
        values: [userId]
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const query = `INSERT INTO recovery_codes (user_id, code, expires_at) VALUES (?, ?, ?)`;
    return await queryDB({ query, values: [userId, code, expiresAt] });
}

export async function getValidCode(userId, code) {
    const query = `
        SELECT * FROM recovery_codes
        WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > NOW()
        LIMIT 1
    `;
    return (await queryDB({ query, values: [userId, code] }))[0] || null;
}

export async function markCodeUsed(userId) {
    const query = `UPDATE recovery_codes SET used = 1 WHERE user_id = ?`;
    return await queryDB({ query, values: [userId] });
}
