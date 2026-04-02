import { queryDB } from '../connection/index.js';

const BR_NOW_DATE = `DATE(CONVERT_TZ(NOW(), '+00:00', '-03:00'))`;
const BR_NOW_TIME = `TIME(CONVERT_TZ(NOW(), '+00:00', '-03:00'))`;

export async function hasVotedToday(userId) {
    const query = `SELECT * FROM voting_history WHERE user_id = ? AND vote_date = ${BR_NOW_DATE} LIMIT 1`;
    return (await queryDB({ query, values: [userId] }))[0] || null;
}

export async function castVote(userId, productId) {
    const query = `INSERT INTO voting_history (user_id, vote_product, vote_date, vote_time) VALUES (?, ?, ${BR_NOW_DATE}, ${BR_NOW_TIME})`;
    return await queryDB({ query, values: [userId, productId] });
}

export async function getTodayVotes() {
    const query = `
        SELECT vh.id, vh.user_id, vh.vote_product, vh.vote_date, vh.vote_time,
               pn.products_name, pn.type, u.email
        FROM voting_history vh
        JOIN product_name pn ON vh.vote_product = pn.id
        JOIN users u ON vh.user_id = u.id
        WHERE vh.vote_date = ${BR_NOW_DATE}
        ORDER BY vh.vote_time DESC
    `;
    return await queryDB({ query, values: [] });
}

export async function getTodayVoteCounts() {
    const query = `
        SELECT vh.vote_product, COUNT(*) as vote_count,
               pn.products_name, pn.type
        FROM voting_history vh
        JOIN product_name pn ON vh.vote_product = pn.id
        WHERE vh.vote_date = ${BR_NOW_DATE}
        GROUP BY vh.vote_product, pn.products_name, pn.type
        ORDER BY vote_count DESC
    `;
    return await queryDB({ query, values: [] });
}

export async function getVoteCountsForDate(dateStr) {
    const query = `
        SELECT vh.vote_product, COUNT(*) as vote_count,
               pn.products_name, pn.type
        FROM voting_history vh
        JOIN product_name pn ON vh.vote_product = pn.id
        WHERE vh.vote_date = ?
        GROUP BY vh.vote_product, pn.products_name, pn.type
        ORDER BY vote_count DESC
    `;
    return await queryDB({ query, values: [dateStr] });
}

export async function getVotingHistory() {
    const query = `
        SELECT vh.id, vh.user_id, vh.vote_product, vh.vote_date, vh.vote_time,
               pn.products_name, pn.type, u.email
        FROM voting_history vh
        JOIN product_name pn ON vh.vote_product = pn.id
        JOIN users u ON vh.user_id = u.id
        ORDER BY vh.vote_date DESC, vh.vote_time DESC
    `;
    return await queryDB({ query, values: [] });
}

export async function getDailyWinner(dateStr) {
    const query = `
        SELECT dw.*, pn.products_name, pn.type
        FROM daily_winner dw
        JOIN product_name pn ON dw.winner_product = pn.id
        WHERE dw.result_date = ?
        LIMIT 1
    `;
    return (await queryDB({ query, values: [dateStr] }))[0] || null;
}

export async function saveDailyWinner(dateStr, productId) {
    const query = `INSERT IGNORE INTO daily_winner (result_date, winner_product, processed) VALUES (?, ?, 0)`;
    return await queryDB({ query, values: [dateStr, productId] });
}

export async function markDailyWinnerProcessed(dateStr) {
    const query = `UPDATE daily_winner SET processed = 1 WHERE result_date = ? AND processed = 0`;
    return await queryDB({ query, values: [dateStr] });
}

export async function decrementProductAmount(productId) {
    const query = `UPDATE product_name SET amount = amount - 1 WHERE id = ?`;
    return await queryDB({ query, values: [productId] });
}

export async function deleteProductById(productId) {
    const query = `DELETE FROM product_name WHERE id = ?`;
    return await queryDB({ query, values: [productId] });
}

export async function getProductAmountById(productId) {
    const query = `SELECT id, amount FROM product_name WHERE id = ? LIMIT 1`;
    return (await queryDB({ query, values: [productId] }))[0] || null;
}
