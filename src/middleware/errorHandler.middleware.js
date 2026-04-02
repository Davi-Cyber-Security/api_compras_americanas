export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor.';

    if (process.env.NODE_ENV !== 'production') {
        console.error(`[${statusCode}] ${message}`);
    }

    res.status(statusCode).json({ error: message });
}
