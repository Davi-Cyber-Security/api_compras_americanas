import { queryDB } from '../connection/index.js';

export async function getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    return (await queryDB({ query, values: [email] }))[0] || null;
}

export async function getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ? LIMIT 1`;
    return (await queryDB({ query, values: [id] }))[0] || null;
}

export async function createUser(email, password) {
    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    return await queryDB({ query, values: [email, password] });
}

export async function deleteUserById(userId) {
    const query = `DELETE FROM users WHERE id = ?`;
    return await queryDB({ query, values: [userId] });
}

export async function getPermissions(userId) {
    const query = `SELECT * FROM permission WHERE user_id = ?`;
    return (await queryDB({ query, values: [userId] }))[0] || null;
}

export async function createPermissions(userId) {
    const query = `INSERT INTO permission (user_id, modification, admin) VALUES (?, 0, 0)`;
    return await queryDB({ query, values: [userId] });
}

export async function updatePermissions(userId, { modification, admin }) {
    const query = `UPDATE permission SET modification = ?, admin = ? WHERE user_id = ?`;
    return await queryDB({ query, values: [modification, admin, userId] });
}
