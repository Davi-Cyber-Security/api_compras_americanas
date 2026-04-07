import { queryDB } from '../connection/index.js';

export async function savePendingRegistration(email, code) {
    await queryDB({
        query: `DELETE FROM pending_registrations WHERE email = ?`,
        values: [email]
    });

    const query = `
        INSERT INTO pending_registrations (email, code, expires_at)
        VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 15 MINUTE))
    `;
    return await queryDB({ query, values: [email, code] });
}

export async function getValidPendingCode(email, code) {
    const query = `
        SELECT * FROM pending_registrations
        WHERE email = ? AND code = ? AND verified = 0 AND expires_at > UTC_TIMESTAMP()
        LIMIT 1
    `;
    return (await queryDB({ query, values: [email, code] }))[0] || null;
}

export async function markPendingVerified(email) {
    const query = `UPDATE pending_registrations SET verified = 1 WHERE email = ?`;
    return await queryDB({ query, values: [email] });
}

export async function getVerifiedPending(email) {
    const query = `
        SELECT * FROM pending_registrations
        WHERE email = ? AND verified = 1 AND expires_at > UTC_TIMESTAMP()
        LIMIT 1
    `;
    return (await queryDB({ query, values: [email] }))[0] || null;
}

export async function deletePendingRegistration(email) {
    const query = `DELETE FROM pending_registrations WHERE email = ?`;
    return await queryDB({ query, values: [email] });
}
