const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL) {
    // Caso 1: CONEXIÓN NUBE (Render/DATABASE_URL)
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // Caso 2: CONEXIÓN LOCAL
    const DB_PORT = parseInt(process.env.DB_PORT, 10) || 5432;
    sequelize = new Sequelize(
        process.env.DB_NOMBRE,
        process.env.DB_USUARIO,
        process.env.DB_CLAVE,
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'postgres',
            port: DB_PORT,
            logging: false
        }
    );
}

module.exports = sequelize;