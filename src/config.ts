import dotenv from 'dotenv';
dotenv.config();

const config = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'typescript_crud_api',
    },
    jwtSecret: process.env.JWT_SECRET || '',
};

export default config;