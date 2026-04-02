import { queryDB } from '../connection/index.js';

export async function getAllProducts() {
    const query = `SELECT * FROM product_name ORDER BY type, products_name`;
    return await queryDB({ query, values: [] });
}

export async function getProductById(id) {
    const query = `SELECT * FROM product_name WHERE id = ? LIMIT 1`;
    return (await queryDB({ query, values: [id] }))[0] || null;
}

export async function insertProduct(userId, { productsName, type, amount }) {
    const query = `INSERT INTO product_name (user_id, products_name, type, amount) VALUES (?, ?, ?, ?)`;
    return await queryDB({ query, values: [userId, productsName, type, amount] });
}

export async function updateProduct(productId, { productsName, type, amount }) {
    const query = `UPDATE product_name SET products_name = ?, type = ?, amount = ? WHERE id = ?`;
    return await queryDB({ query, values: [productsName, type, amount, productId] });
}

export async function deleteProduct(productId) {
    const query = `DELETE FROM product_name WHERE id = ?`;
    return await queryDB({ query, values: [productId] });
}
