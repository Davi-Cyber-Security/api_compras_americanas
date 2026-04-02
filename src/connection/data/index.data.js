import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: true },
    timezone: '-03:00',
});
