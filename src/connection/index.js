import { Pool } from './data/index.data.js';
import AppError from '../middleware/appError.middleware.js';

export async function queryDB({query, values}) {
    try {
        const [results] = await Pool.execute(query, values);
        return results;
    } catch (error) {
        throw new AppError(error.message, error.statusCode);
    }
}