import { vote as castVote, canUserVote, todayVotes, votingResult, history } from '../service/voting.service.js';

export async function vote(req, res, next) {
    try {
        const { productId } = req.body;
        const result = await castVote(req.user.id, productId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function canVote(req, res, next) {
    try {
        const result = await canUserVote(req.user.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function today(req, res, next) {
    try {
        const result = await todayVotes();
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function result(req, res, next) {
    try {
        const data = await votingResult();
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function getHistory(req, res, next) {
    try {
        const data = await history();
        res.json(data);
    } catch (error) {
        next(error);
    }
}
