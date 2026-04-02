import { getAllProducts, getProductById, insertProduct, updateProduct as updateProductRepo, deleteProduct as deleteProductRepo } from '../repositories/products.repositories.js';
import AppError from '../middleware/appError.middleware.js';
import { validateProductName, validateAmount, validateType } from '../util/inputsValid.util.js';

export async function listProducts() {
    return await getAllProducts();
}

export async function getProduct(productId) {
    const product = await getProductById(productId);
    if (!product) throw new AppError('Produto não encontrado.', 404);
    return product;
}

export async function createProduct(userId, { productsName, type, amount }) {
    validateProductName(productsName);
    validateType(type);
    validateAmount(amount);

    const result = await insertProduct(userId, { productsName, type: type.toLowerCase(), amount });
    return { id: result.insertId, message: 'Produto cadastrado com sucesso!' };
}

export async function editProduct(productId, { productsName, type, amount }) {
    const product = await getProductById(productId);
    if (!product) throw new AppError('Produto não encontrado.', 404);

    validateProductName(productsName);
    validateType(type);
    validateAmount(amount);

    await updateProductRepo(productId, { productsName, type: type.toLowerCase(), amount });
    return { message: 'Produto atualizado com sucesso!' };
}

export async function removeProduct(productId) {
    const product = await getProductById(productId);
    if (!product) throw new AppError('Produto não encontrado.', 404);

    await deleteProductRepo(productId);
    return { message: 'Produto deletado com sucesso!' };
}
