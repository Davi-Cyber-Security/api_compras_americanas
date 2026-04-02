import AppError from '../middleware/appError.middleware.js';

export function validateEmail(email) {
    if (!email || typeof email !== 'string') throw new AppError('Email é obrigatório.', 400);
    const regex = /^[a-zA-Z0-9._%+-]+@academico.unirv\.edu\.br$/i;
    if (!regex.test(email)) throw new AppError('Email inválido. Adicione o e-mail acadêmico (@unirv.edu.br).', 400);
    if (email.length > 100) throw new AppError('Email muito longo. Máximo de 100 caracteres.', 400);
    if (email.length < 5) throw new AppError('Email muito curto. Mínimo de 5 caracteres.', 400);
}

export function validatePassword(password) {
    if (!password || typeof password !== 'string') throw new AppError('Senha é obrigatória.', 400);
    if (password.length < 6) throw new AppError('Senha muito curta. Mínimo de 6 caracteres.', 400);
    if (password.length > 100) throw new AppError('Senha muito longa. Máximo de 100 caracteres.', 400);
}

export function validateProductName(productName) {
    if (!productName || typeof productName !== 'string') throw new AppError('Nome do produto é obrigatório.', 400);
    if (productName.length < 3) throw new AppError('Nome do produto muito curto. Mínimo de 3 caracteres.', 400);
    if (productName.length > 100) throw new AppError('Nome do produto muito longo. Máximo de 100 caracteres.', 400);
}

export function validateAmount(amount) {
    if (amount === undefined || amount === null) throw new AppError('Quantidade é obrigatória.', 400);
    const num = Number(amount);
    if (isNaN(num) || num < 1) throw new AppError('Quantidade inválida. Mínimo de 1.', 400);
    if (num > 1000000) throw new AppError('Quantidade muito grande. Máximo de 1.000.000.', 400);
}

export function validateType(type) {
    if (!type || typeof type !== 'string') throw new AppError('Tipo do produto é obrigatório.', 400);
    const validTypes = ['salgado', 'doce', 'meio doce e meio salgado'];
    if (!validTypes.includes(type.toLowerCase())) {
        throw new AppError('Tipo inválido. Escolha entre: salgado, doce, meio doce e meio salgado.', 400);
    }
}
