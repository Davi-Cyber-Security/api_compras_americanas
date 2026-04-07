import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/products.routes.js';
import votingRoutes from './routes/voting.routes.js';
import userRoutes from './routes/user.routes.js';
import recoverPasswordRoutes from './routes/recoverPassword.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { startScheduler } from './scheduler/voteReminder.scheduler.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 800,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});
app.use(limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});
app.use('/api/auth', authLimiter);
app.use('/api/recover', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recover', recoverPasswordRoutes);

app.use(errorHandler);

export function startServer() {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        startScheduler();
    });
}

export default app;
