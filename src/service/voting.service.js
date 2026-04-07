import {
    hasVotedToday, castVote, getTodayVotes, getTodayVoteCounts,
    getVotingHistory, getDailyWinner, saveDailyWinner,
    markDailyWinnerProcessed, decrementProductAmount,
    deleteProductById, getProductAmountById, getVoteCountsForDate
} from '../repositories/voting.repositories.js';
import { getProductById } from '../repositories/products.repositories.js';
import AppError from '../middleware/appError.middleware.js';

function getBrazilNow() {
    const brString = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    return new Date(brString);
}

function toDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = domingo, 6 = sábado
}

async function processYesterdayWinner() {
    const brNow = getBrazilNow();
    const yesterday = new Date(brNow);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toDateStr(yesterday);

    let winner = await getDailyWinner(yesterdayStr);

    if (!winner) {
        const counts = await getVoteCountsForDate(yesterdayStr);
        if (counts.length === 0) return;

        const maxVotes = Number(counts[0].vote_count);
        const topProducts = counts.filter(c => Number(c.vote_count) === maxVotes);
        const picked = topProducts[Math.floor(Math.random() * topProducts.length)];

        await saveDailyWinner(yesterdayStr, picked.vote_product);
        winner = await getDailyWinner(yesterdayStr);
        if (!winner) return;
    }

    if (winner.processed) return;

    const result = await markDailyWinnerProcessed(yesterdayStr);
    if (result.affectedRows === 0) return;

    await decrementProductAmount(winner.winner_product);

    const product = await getProductAmountById(winner.winner_product);
    if (product && product.amount <= 0) {
        await deleteProductById(winner.winner_product);
    }
}

export async function vote(userId, productId) {
    if (!productId) throw new AppError('ID do produto é obrigatório.', 400);

    const brNow = getBrazilNow();

    if (isWeekend(brNow)) {
        throw new AppError('Votação indisponível aos finais de semana. Volte na segunda-feira!', 400);
    }

    if (brNow.getHours() >= 18) {
        throw new AppError('Votação encerrada. O resultado sai às 18:00.', 400);
    }

    const alreadyVoted = await hasVotedToday(userId);
    if (alreadyVoted) throw new AppError('Você já votou hoje. Volte amanhã!', 400);

    const product = await getProductById(productId);
    if (!product) throw new AppError('Produto não encontrado.', 404);

    await castVote(userId, productId);
    return { message: 'Voto registrado com sucesso!' };
}

export async function canUserVote(userId) {
    const brNow = getBrazilNow();

    if (isWeekend(brNow)) {
        const dayName = brNow.getDay() === 6 ? 'Sábado' : 'Domingo';
        return { canVote: false, reason: `${dayName}: votação indisponível no fim de semana. Volte na segunda-feira!` };
    }

    if (brNow.getHours() >= 18) {
        return { canVote: false, reason: 'Votação encerrada às 18:00.' };
    }

    const alreadyVoted = await hasVotedToday(userId);
    if (alreadyVoted) {
        return { canVote: false, reason: 'Você já votou hoje.' };
    }

    return { canVote: true, reason: null };
}

export async function todayVotes() {
    await processYesterdayWinner();
    const votes = await getTodayVotes();
    const counts = await getTodayVoteCounts();
    return { votes, counts };
}

export async function votingResult() {
    await processYesterdayWinner();

    const brNow = getBrazilNow();
    const todayStr = toDateStr(brNow);
    const brHour = brNow.getHours();
    const counts = await getTodayVoteCounts();

    if (brHour < 18) {
        return {
            winner: null,
            message: 'Votação aberta até às 18:00.',
            counts,
            votingOpen: true
        };
    }

    if (counts.length === 0) {
        return {
            winner: null,
            message: 'Nenhum voto registrado hoje.',
            counts,
            votingOpen: false
        };
    }

    const existing = await getDailyWinner(todayStr);
    if (existing) {
        const wc = counts.find(c => c.vote_product === existing.winner_product);
        return {
            winner: {
                vote_product: existing.winner_product,
                products_name: existing.products_name,
                type: existing.type,
                vote_count: wc ? Number(wc.vote_count) : 0
            },
            message: `${existing.products_name} venceu!`,
            counts,
            votingOpen: false
        };
    }

    const maxVotes = Number(counts[0].vote_count);
    const topProducts = counts.filter(c => Number(c.vote_count) === maxVotes);

    let winner;
    let message;

    if (topProducts.length === 1) {
        winner = topProducts[0];
        message = `${winner.products_name} venceu com ${maxVotes} voto(s)!`;
    } else {
        const idx = Math.floor(Math.random() * topProducts.length);
        winner = topProducts[idx];
        message = `Empate! ${winner.products_name} foi escolhido aleatoriamente.`;
    }

    await saveDailyWinner(todayStr, winner.vote_product);

    return { winner, message, counts, votingOpen: false };
}

export async function history() {
    const votes = await getVotingHistory();

    const grouped = {};
    for (const v of votes) {
        const date = new Date(v.vote_date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][month]) grouped[year][month] = {};
        if (!grouped[year][month][day]) grouped[year][month][day] = [];

        grouped[year][month][day].push({
            email: v.email,
            products_name: v.products_name,
            type: v.type,
            vote_time: v.vote_time
        });
    }

    return grouped;
}
