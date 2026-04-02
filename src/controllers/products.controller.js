import { listProducts, createProduct, editProduct, removeProduct, getProduct } from '../service/products.service.js';

export async function getAll(req, res, next) {
    try {
        const products = await listProducts();
        res.json(products);
    } catch (error) {
        next(error);
    }
}

export async function getById(req, res, next) {
    try {
        const product = await getProduct(req.params.id);
        res.json(product);
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const { productsName, type, amount } = req.body;
        const result = await createProduct(req.user.id, { productsName, type, amount });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const { productsName, type, amount } = req.body;
        const result = await editProduct(req.params.id, { productsName, type, amount });
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function remove(req, res, next) {
    try {
        const result = await removeProduct(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
}
